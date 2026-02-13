import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    CalendarDays,
    Euro,
    Filter,
    Search,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { apiGet } from '../src/api';

const AdminDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState('');
    const [curveRangeMonths, setCurveRangeMonths] = useState('6');
    const [curveMetric, setCurveMetric] = useState('amount');
    const [eventCurveMetric, setEventCurveMetric] = useState('created');
    const [rankingMode, setRankingMode] = useState('highest_amount');
    const [rankingSearch, setRankingSearch] = useState('');
    const CORE_STATS_TIMEOUT_MS = 45000;
    const MODERATION_TIMEOUT_MS = 30000;
    const RETRY_COUNT = 2;

    const normalizeStatus = (value) => {
        if (!value) return '';
        return value
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    const mapStatus = (value) => {
        const normalized = normalizeStatus(value);
        if (!normalized) return '';
        if (['paye', 'payee', 'paid', 'valide', 'validee'].includes(normalized)) return 'paid';
        if (['retard', 'late'].includes(normalized)) return 'late';
        if (['attente', 'pending', 'en_attente'].includes(normalized)) return 'pending';
        return '';
    };

    const formatAmount = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) return `${value}`;
        return `${numberValue.toFixed(2)} F CFA`;
    };

    const formatCompactAmount = (value) => {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) return '-';
        const compact = new Intl.NumberFormat('fr-FR', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(numberValue);
        return `${compact} F`;
    };

    const formatDateTime = (ms) => {
        if (!ms) return '-';
        const parsed = new Date(ms);
        if (Number.isNaN(parsed.getTime())) return '-';
        return parsed.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getPaymentAmount = (payment) => {
        const raw = payment?.montant ?? payment?.amount;
        const numberValue = Number(raw);
        return Number.isNaN(numberValue) ? null : numberValue;
    };

    const getPaymentStatus = (payment) => {
        const amount = getPaymentAmount(payment);
        if (amount !== null && amount <= 0) return 'pending';
        if (amount !== null && amount > 0) {
            return mapStatus(payment?.statut ?? payment?.status) || 'paid';
        }
        return mapStatus(payment?.statut ?? payment?.status);
    };

    const getPaymentDateMs = (payment) => {
        const value =
            payment?.date ??
            payment?.created_at ??
            payment?.createdAt ??
            payment?.paid_at ??
            payment?.timestamp;
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
    };

    const getPaymentUserId = (payment) => {
        const value =
            payment?.user_id ??
            payment?.membre_id ??
            payment?.member_id ??
            payment?.adherente_id ??
            payment?.user?.id ??
            payment?.member?.id ??
            payment?.membre?.id ??
            payment?.adherente?.id;
        if (value === null || value === undefined || value === '') return null;
        return `${value}`;
    };

    const getEventParticipantsCount = (event) => {
        const directCount = Number(
            event?.participants_count ??
            event?.inscriptions_count ??
            event?.participantsCount ??
            event?.inscrits_count
        );
        if (!Number.isNaN(directCount) && directCount >= 0) return directCount;
        const participants =
            (Array.isArray(event?.participants) && event.participants) ||
            (Array.isArray(event?.inscriptions) && event.inscriptions) ||
            (Array.isArray(event?.adherentes) && event.adherentes) ||
            [];
        return participants.length;
    };

    const getEventStatusToken = (event) => normalizeStatus(
        event?.statut ??
        event?.status ??
        event?.etat ??
        event?.state ??
        event?.validation_status ??
        event?.moderation_status
    );

    const toBoolFlag = (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value === 1;
        if (typeof value === 'string') {
            const token = normalizeStatus(value);
            if (['1', 'true', 'yes', 'oui'].includes(token)) return true;
            if (['0', 'false', 'no', 'non'].includes(token)) return false;
        }
        return null;
    };

    const isEventRejected = (event) => {
        const rejectedFlag = toBoolFlag(event?.is_rejected ?? event?.rejected ?? event?.is_refused ?? event?.refused);
        if (rejectedFlag === true) return true;
        const statusToken = getEventStatusToken(event);
        return ['rejete', 'rejected', 'refuse', 'declined', 'annule', 'cancelled'].some((label) =>
            statusToken.includes(label)
        );
    };

    const isEventValidated = (event) => {
        const validatedFlag = toBoolFlag(event?.is_validated ?? event?.validated ?? event?.valide ?? event?.is_approved ?? event?.approved);
        if (validatedFlag === true) return true;
        const statusToken = getEventStatusToken(event);
        return ['valide', 'validated', 'approve', 'approuve', 'publie', 'published', 'actif', 'active', 'live', 'termine', 'ended'].some((label) =>
            statusToken.includes(label)
        );
    };

    const isEventPending = (event, pendingEventIds) => {
        if (event?.id !== undefined && event?.id !== null && pendingEventIds.has(`${event.id}`)) return true;
        const pendingFlag = toBoolFlag(event?.is_pending ?? event?.pending ?? event?.en_attente ?? event?.submitted_for_validation);
        if (pendingFlag === true) return true;
        if (isEventRejected(event) || isEventValidated(event)) return false;
        const statusToken = getEventStatusToken(event);
        return ['pending', 'attente', 'review', 'moderation', 'draft', 'propose', 'submitted'].some((label) =>
            statusToken.includes(label)
        );
    };

    const getEventCreatedDateMs = (event) => {
        const value =
            event?.created_at ??
            event?.createdAt ??
            event?.date_creation ??
            event?.date_debut ??
            event?.start_date;
        if (!value) return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchWithRetry = async (endpoint, { timeout = CORE_STATS_TIMEOUT_MS, retries = RETRY_COUNT } = {}) => {
        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt += 1) {
            try {
                return await apiGet(endpoint, { timeout });
            } catch (error) {
                lastError = error;
                const status = error?.status;
                const message = (error?.message || '').toLowerCase();
                const shouldRetry =
                    attempt < retries &&
                    (
                        !status ||
                        status >= 500 ||
                        message.includes('timeout') ||
                        message.includes('failed to fetch')
                    );

                if (!shouldRetry) break;
                await wait(1200 * (attempt + 1));
            }
        }

        throw lastError;
    };

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            setStatsError('');
            const coreResults = await Promise.allSettled([
                fetchWithRetry('/api/cotisations', { timeout: CORE_STATS_TIMEOUT_MS }),
                fetchWithRetry('/api/users', { timeout: CORE_STATS_TIMEOUT_MS }),
                fetchWithRetry('/api/evenements', { timeout: CORE_STATS_TIMEOUT_MS }),
            ]);

            const [paymentsResult, usersResult, eventsResult] = coreResults;
            const failedCore = [];

            if (paymentsResult.status === 'fulfilled') {
                const paymentsList = Array.isArray(paymentsResult.value)
                    ? paymentsResult.value
                    : paymentsResult.value?.data ?? [];
                setPayments(Array.isArray(paymentsList) ? paymentsList : []);
            } else {
                setPayments([]);
                failedCore.push('cotisations');
            }

            if (usersResult.status === 'fulfilled') {
                const usersList = Array.isArray(usersResult.value)
                    ? usersResult.value
                    : usersResult.value?.data ?? [];
                setUsers(Array.isArray(usersList) ? usersList : []);
            } else {
                setUsers([]);
                failedCore.push('adhérentes');
            }

            if (eventsResult.status === 'fulfilled') {
                const eventsList = Array.isArray(eventsResult.value)
                    ? eventsResult.value
                    : eventsResult.value?.data ?? [];
                setEvents(Array.isArray(eventsList) ? eventsList : []);
            } else {
                setEvents([]);
                failedCore.push('événements');
            }

            const moderationResults = await Promise.allSettled([
                fetchWithRetry('/api/admin/pending-users', { timeout: MODERATION_TIMEOUT_MS }),
                fetchWithRetry('/api/admin/pending-events', { timeout: MODERATION_TIMEOUT_MS }),
            ]);

            const [pendingUsersResult, pendingEventsResult] = moderationResults;

            if (pendingUsersResult.status === 'fulfilled') {
                const pendingList = Array.isArray(pendingUsersResult.value)
                    ? pendingUsersResult.value
                    : pendingUsersResult.value?.data ?? [];
                setPendingUsers(Array.isArray(pendingList) ? pendingList : []);
            } else {
                setPendingUsers([]);
            }

            if (pendingEventsResult.status === 'fulfilled') {
                const pendingEventsList = Array.isArray(pendingEventsResult.value)
                    ? pendingEventsResult.value
                    : pendingEventsResult.value?.data ?? [];
                setPendingEvents(Array.isArray(pendingEventsList) ? pendingEventsList : []);
            } else {
                setPendingEvents([]);
            }

            if (failedCore.length > 0) {
                setStatsError(`Certaines données n'ont pas pu être chargées: ${failedCore.join(', ')}.`);
            }

            setIsLoadingStats(false);
        };

        fetchStats();
    }, []);

    const usersById = useMemo(() => {
        const map = new Map();
        users.forEach((user) => {
            if (user?.id !== null && user?.id !== undefined) {
                map.set(`${user.id}`, user);
            }
        });
        return map;
    }, [users]);

    const paidPayments = useMemo(() => {
        return payments
            .map((payment) => {
                const amount = getPaymentAmount(payment);
                const status = getPaymentStatus(payment);
                const dateMs = getPaymentDateMs(payment);
                const userId = getPaymentUserId(payment);
                const linkedUser = userId ? usersById.get(userId) : null;
                const name = `${payment?.nom ?? linkedUser?.nom ?? ''} ${payment?.prenom ?? linkedUser?.prenom ?? ''}`.trim();
                return {
                    payment,
                    amount,
                    status,
                    dateMs,
                    userId,
                    name: name || '-',
                };
            })
            .filter((item) => item.status === 'paid' && item.amount !== null && item.amount > 0);
    }, [payments, usersById]);

    const allTrackedUsers = useMemo(() => {
        return users
            .filter((user) => normalizeStatus(user?.statut) !== 'pending')
            .map((user) => {
                const key = user?.id !== null && user?.id !== undefined
                    ? `${user.id}`
                    : `${user?.nom ?? ''}-${user?.prenom ?? ''}-${user?.email ?? ''}`;
                const name = `${user?.nom ?? ''} ${user?.prenom ?? ''}`.trim() || user?.email || '-';
                return { key, userId: user?.id !== null && user?.id !== undefined ? `${user.id}` : null, name };
            });
    }, [users]);

    const stats = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        let totalCollected = 0;
        let unpaidCount = 0;

        payments.forEach((payment) => {
            const status = getPaymentStatus(payment);
            const amount = getPaymentAmount(payment);
            const dateMs = getPaymentDateMs(payment);
            if (status === 'paid' && amount !== null) {
                const yearMatch = dateMs ? new Date(dateMs).getFullYear() === currentYear : true;
                if (yearMatch) {
                    totalCollected += amount;
                }
            }
            if (status === 'late' || status === 'pending') {
                unpaidCount += 1;
            }
        });

        const activeMembersCount = users.filter((user) => (user?.statut ?? '').toLowerCase() === 'actif').length;

        return [
            {
                title: 'Adhérentes Actives',
                value: `${activeMembersCount}`,
                icon: Users,
                iconBg: 'bg-fuchsia-100',
                iconColor: 'text-fuchsia-600',
            },
            {
                title: 'Cotisations Total (Annuel)',
                value: formatAmount(totalCollected),
                icon: Euro,
                iconBg: 'bg-fuchsia-100',
                iconColor: 'text-fuchsia-600',
            },
            {
                title: 'Cotisations en attente',
                value: `${unpaidCount}`,
                icon: AlertTriangle,
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
            },
            {
                title: 'Demandes en attente',
                value: `${pendingUsers.length}`,
                icon: CalendarDays,
                iconBg: 'bg-fuchsia-100',
                iconColor: 'text-fuchsia-600',
            },
        ];
    }, [payments, users, pendingUsers]);

    const eventInsights = useMemo(() => {
        const pendingEventIds = new Set(
            pendingEvents
                .filter((event) => event?.id !== null && event?.id !== undefined)
                .map((event) => `${event.id}`)
        );

        let totalRegistrations = 0;
        let validatedCount = 0;
        let rejectedCount = 0;
        let pendingCount = 0;

        events.forEach((event) => {
            totalRegistrations += getEventParticipantsCount(event);

            if (isEventRejected(event)) {
                rejectedCount += 1;
                return;
            }
            if (isEventPending(event, pendingEventIds)) {
                pendingCount += 1;
                return;
            }
            if (isEventValidated(event) || pendingEventIds.size > 0) {
                validatedCount += 1;
                return;
            }
            pendingCount += 1;
        });

        const totalEvents = events.length;
        const effectivePendingCount = pendingEventIds.size > 0
            ? Math.max(pendingCount, pendingEventIds.size)
            : pendingCount;
        const moderationBase = validatedCount + rejectedCount;
        const approvalRate = moderationBase > 0 ? Math.round((validatedCount / moderationBase) * 100) : 0;

        return {
            totalEvents,
            totalRegistrations,
            validatedCount,
            rejectedCount,
            pendingCount: effectivePendingCount,
            approvalRate,
        };
    }, [events, pendingEvents]);

    const eventStats = useMemo(() => ([
        {
            title: 'Événements créés',
            value: `${eventInsights.totalEvents}`,
            icon: CalendarDays,
            iconBg: 'bg-fuchsia-100',
            iconColor: 'text-fuchsia-600',
        },
        {
            title: 'Inscriptions événements',
            value: `${eventInsights.totalRegistrations}`,
            icon: Users,
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'Événements validés',
            value: `${eventInsights.validatedCount}`,
            icon: CheckCircle2,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            title: 'Événements rejetés',
            value: `${eventInsights.rejectedCount}`,
            icon: XCircle,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
        {
            title: 'Événements en attente',
            value: `${eventInsights.pendingCount}`,
            icon: Clock3,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    ]), [eventInsights]);

    const monthlyCurveData = useMemo(() => {
        const range = Number(curveRangeMonths) || 6;
        const now = new Date();
        const monthLabels = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛ', 'SEPT', 'OCT', 'NOV', 'DÉC'];

        const months = Array.from({ length: range }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (range - 1 - index), 1);
            return {
                key: `${date.getFullYear()}-${date.getMonth()}`,
                label: monthLabels[date.getMonth()],
                month: date.getMonth(),
                year: date.getFullYear(),
                totalAmount: 0,
                paymentCount: 0,
            };
        });

        paidPayments.forEach((entry) => {
            if (!entry.dateMs) return;
            const paymentDate = new Date(entry.dateMs);
            const target = months.find(
                (month) => month.month === paymentDate.getMonth() && month.year === paymentDate.getFullYear(),
            );
            if (!target) return;
            target.totalAmount += Number(entry.amount ?? 0);
            target.paymentCount += 1;
        });

        return months;
    }, [paidPayments, curveRangeMonths]);

    const chartModel = useMemo(() => {
        const values = monthlyCurveData.map((month) => (
            curveMetric === 'count' ? month.paymentCount : month.totalAmount
        ));
        const maxValue = Math.max(1, ...values);
        const width = 760;
        const height = 280;
        const left = 20;
        const right = 20;
        const top = 20;
        const bottom = 34;
        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;
        const baseY = height - bottom;
        const stepX = values.length > 1 ? innerWidth / (values.length - 1) : 0;

        const points = values.map((value, index) => {
            const x = left + (index * stepX);
            const y = baseY - ((value / maxValue) * innerHeight);
            return { x, y, value };
        });

        const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
        const areaPath = points.length
            ? `M ${left} ${baseY} L ${polylinePoints} L ${left + innerWidth} ${baseY} Z`
            : '';

        return {
            width,
            height,
            left,
            innerWidth,
            innerHeight,
            baseY,
            maxValue,
            points,
            polylinePoints,
            areaPath,
        };
    }, [monthlyCurveData, curveMetric]);

    const eventMonthlyData = useMemo(() => {
        const range = Number(curveRangeMonths) || 6;
        const now = new Date();
        const monthLabels = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛ', 'SEPT', 'OCT', 'NOV', 'DÉC'];
        const pendingEventIds = new Set(
            pendingEvents
                .filter((event) => event?.id !== null && event?.id !== undefined)
                .map((event) => `${event.id}`)
        );

        const months = Array.from({ length: range }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (range - 1 - index), 1);
            return {
                key: `${date.getFullYear()}-${date.getMonth()}`,
                label: monthLabels[date.getMonth()],
                month: date.getMonth(),
                year: date.getFullYear(),
                createdCount: 0,
                registrationsCount: 0,
                validatedCount: 0,
                rejectedCount: 0,
            };
        });

        events.forEach((event) => {
            const eventMs = getEventCreatedDateMs(event);
            if (!eventMs) return;
            const eventDate = new Date(eventMs);
            const target = months.find(
                (month) => month.month === eventDate.getMonth() && month.year === eventDate.getFullYear(),
            );
            if (!target) return;

            target.createdCount += 1;
            target.registrationsCount += getEventParticipantsCount(event);
            if (isEventRejected(event)) {
                target.rejectedCount += 1;
                return;
            }
            if (!isEventPending(event, pendingEventIds)) {
                target.validatedCount += 1;
            }
        });

        return months;
    }, [events, pendingEvents, curveRangeMonths]);

    const eventChartModel = useMemo(() => {
        const values = eventMonthlyData.map((month) => {
            if (eventCurveMetric === 'created') return month.createdCount;
            if (eventCurveMetric === 'registrations') return month.registrationsCount;
            if (eventCurveMetric === 'validated') return month.validatedCount;
            if (eventCurveMetric === 'rejected') return month.rejectedCount;
            return month.createdCount;
        });

        const maxValue = Math.max(1, ...values);
        const width = 760;
        const height = 260;
        const left = 18;
        const right = 18;
        const top = 16;
        const bottom = 34;
        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;
        const barWidth = values.length > 0 ? Math.max(18, (innerWidth / values.length) * 0.55) : 24;

        const bars = values.map((value, index) => {
            const stepX = innerWidth / Math.max(values.length, 1);
            const x = left + (index * stepX) + ((stepX - barWidth) / 2);
            const barHeight = (value / maxValue) * innerHeight;
            const y = top + (innerHeight - barHeight);
            return { x, y, barHeight, value };
        });

        return {
            width,
            height,
            left,
            innerWidth,
            innerHeight,
            baseY: top + innerHeight,
            maxValue,
            bars,
        };
    }, [eventMonthlyData, eventCurveMetric]);

    const topEventsByParticipants = useMemo(() => {
        return [...events]
            .map((event) => ({
                id: event?.id ?? `${event?.titre ?? event?.title ?? 'event'}`,
                title: event?.titre ?? event?.title ?? 'Sans titre',
                participants: getEventParticipantsCount(event),
                dateMs: getEventCreatedDateMs(event),
            }))
            .sort((a, b) => {
                if (b.participants !== a.participants) return b.participants - a.participants;
                if (!a.dateMs && !b.dateMs) return 0;
                if (!a.dateMs) return 1;
                if (!b.dateMs) return -1;
                return b.dateMs - a.dateMs;
            });
    }, [events]);

    const memberProfiles = useMemo(() => {
        const profileMap = new Map();

        allTrackedUsers.forEach((user) => {
            profileMap.set(user.key, {
                key: user.key,
                userId: user.userId,
                name: user.name,
                totalAmount: 0,
                paymentCount: 0,
                firstPaymentMs: null,
                lastPaymentMs: null,
            });
        });

        paidPayments.forEach((entry) => {
            const key = entry.userId || entry.name;
            const existing = profileMap.get(key) || {
                key,
                userId: entry.userId,
                name: entry.name,
                totalAmount: 0,
                paymentCount: 0,
                firstPaymentMs: null,
                lastPaymentMs: null,
            };

            existing.totalAmount += Number(entry.amount ?? 0);
            existing.paymentCount += 1;
            if (entry.dateMs) {
                existing.firstPaymentMs =
                    existing.firstPaymentMs === null ? entry.dateMs : Math.min(existing.firstPaymentMs, entry.dateMs);
                existing.lastPaymentMs =
                    existing.lastPaymentMs === null ? entry.dateMs : Math.max(existing.lastPaymentMs, entry.dateMs);
            }
            profileMap.set(key, existing);
        });

        return Array.from(profileMap.values());
    }, [allTrackedUsers, paidPayments]);

    const rankedProfiles = useMemo(() => {
        const query = rankingSearch.trim().toLowerCase();
        const filtered = memberProfiles.filter((profile) => {
            if (!query) return true;
            return profile.name.toLowerCase().includes(query);
        });

        const list = [...filtered];
        if (rankingMode === 'highest_amount') {
            list.sort((a, b) => b.totalAmount - a.totalAmount);
        }
        if (rankingMode === 'highest_frequency') {
            list.sort((a, b) => {
                if (b.paymentCount !== a.paymentCount) return b.paymentCount - a.paymentCount;
                return b.totalAmount - a.totalAmount;
            });
        }
        if (rankingMode === 'earliest_payment') {
            list.sort((a, b) => {
                if (a.firstPaymentMs === null && b.firstPaymentMs === null) return 0;
                if (a.firstPaymentMs === null) return 1;
                if (b.firstPaymentMs === null) return -1;
                return a.firstPaymentMs - b.firstPaymentMs;
            });
        }
        if (rankingMode === 'latest_payment') {
            list.sort((a, b) => {
                if (a.lastPaymentMs === null && b.lastPaymentMs === null) return 0;
                if (a.lastPaymentMs === null) return 1;
                if (b.lastPaymentMs === null) return -1;
                return b.lastPaymentMs - a.lastPaymentMs;
            });
        }

        return list;
    }, [memberProfiles, rankingMode, rankingSearch]);

    const rankingLabel = useMemo(() => {
        if (rankingMode === 'highest_amount') return 'Plus gros montant';
        if (rankingMode === 'highest_frequency') return 'Fréquence de paiement';
        if (rankingMode === 'earliest_payment') return 'Paiement le plus tôt';
        if (rankingMode === 'latest_payment') return 'Paiement le plus récent';
        return '';
    }, [rankingMode]);

    const rankingValue = (profile) => {
        if (rankingMode === 'highest_amount') return formatAmount(profile.totalAmount);
        if (rankingMode === 'highest_frequency') return `${profile.paymentCount} paiement(s)`;
        if (rankingMode === 'earliest_payment') return formatDateTime(profile.firstPaymentMs);
        if (rankingMode === 'latest_payment') return formatDateTime(profile.lastPaymentMs);
        return '-';
    };

    return (
        <div className="flex-1 bg-[#FDF5FA] p-8">
            {statsError && (
                <div className="mb-6 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border border-red-200">
                    {statsError}
                </div>
            )}

            <div className="grid grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {isLoadingStats ? '-' : stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-5 gap-6 mb-8">
                {eventStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {isLoadingStats ? '-' : stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-fuchsia-700" />
                                Courbe des cotisations
                            </h2>
                            <p className="text-sm text-gray-500">
                                Analyse dynamique des montants et des volumes de paiements.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={curveMetric}
                                onChange={(e) => setCurveMetric(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            >
                                <option value="amount">Montant total</option>
                                <option value="count">Nombre de paiements</option>
                            </select>
                            <select
                                value={curveRangeMonths}
                                onChange={(e) => setCurveRangeMonths(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            >
                                <option value="3">3 mois</option>
                                <option value="6">6 mois</option>
                                <option value="12">12 mois</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/30 p-4">
                        <svg viewBox={`0 0 ${chartModel.width} ${chartModel.height}`} className="w-full h-64">
                            {[0.25, 0.5, 0.75, 1].map((ratio) => {
                                const y = chartModel.baseY - (ratio * chartModel.innerHeight);
                                return (
                                    <line
                                        key={ratio}
                                        x1={chartModel.left}
                                        x2={chartModel.left + chartModel.innerWidth}
                                        y1={y}
                                        y2={y}
                                        stroke="#f2d7e9"
                                        strokeWidth="1"
                                    />
                                );
                            })}
                            {chartModel.areaPath && (
                                <path d={chartModel.areaPath} fill="rgba(217, 79, 175, 0.15)" />
                            )}
                            {chartModel.polylinePoints && (
                                <polyline
                                    points={chartModel.polylinePoints}
                                    fill="none"
                                    stroke="#9D216E"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                            {chartModel.points.map((point, index) => (
                                <circle
                                    key={`${index}-${point.x}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="4.5"
                                    fill="#D94FAF"
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            ))}
                        </svg>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            {monthlyCurveData.map((month) => (
                                <span key={month.key}>{month.label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-lg bg-fuchsia-50 px-4 py-3">
                        <p className="text-sm text-fuchsia-800">
                            Pic observé:{' '}
                            <span className="font-semibold">
                                {curveMetric === 'amount'
                                    ? formatCompactAmount(chartModel.maxValue)
                                    : `${Math.round(chartModel.maxValue)} paiement(s)`}
                            </span>
                        </p>
                        <p className="text-xs text-fuchsia-700">
                            Données basées sur les paiements validés
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Classement payeuses</h2>
                        <Filter className="w-4 h-4 text-fuchsia-600" />
                    </div>
                    <div className="space-y-3 mb-4">
                        <select
                            value={rankingMode}
                            onChange={(e) => setRankingMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        >
                            <option value="highest_amount">Plus gros montant</option>
                            <option value="earliest_payment">Paiement le plus tôt</option>
                            <option value="latest_payment">Paiement le plus récent</option>
                            <option value="highest_frequency">Fréquence de paiement</option>
                        </select>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={rankingSearch}
                                onChange={(e) => setRankingSearch(e.target.value)}
                                placeholder="Rechercher une adhérente..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {rankedProfiles.slice(0, 8).map((profile, index) => (
                            <div
                                key={profile.key}
                                className="flex items-center justify-between rounded-lg border border-fuchsia-100 px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {index + 1}. {profile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {profile.paymentCount} paiement(s)
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-fuchsia-700">
                                    {rankingValue(profile)}
                                </span>
                            </div>
                        ))}
                        {!isLoadingStats && rankedProfiles.length === 0 && (
                            <div className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500 text-center">
                                Aucune donnée disponible pour ce filtre.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-fuchsia-700" />
                                Analyse des événements
                            </h2>
                            <p className="text-sm text-gray-500">
                                Suivi des créations, validations, rejets et inscriptions.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={eventCurveMetric}
                                onChange={(e) => setEventCurveMetric(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                            >
                                <option value="created">Événements créés</option>
                                <option value="registrations">Inscriptions</option>
                                <option value="validated">Validations</option>
                                <option value="rejected">Rejets</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/30 p-4">
                        <svg viewBox={`0 0 ${eventChartModel.width} ${eventChartModel.height}`} className="w-full h-60">
                            {[0.25, 0.5, 0.75, 1].map((ratio) => {
                                const y = eventChartModel.baseY - (ratio * eventChartModel.innerHeight);
                                return (
                                    <line
                                        key={`event-grid-${ratio}`}
                                        x1={eventChartModel.left}
                                        x2={eventChartModel.left + eventChartModel.innerWidth}
                                        y1={y}
                                        y2={y}
                                        stroke="#f2d7e9"
                                        strokeWidth="1"
                                    />
                                );
                            })}
                            {eventChartModel.bars.map((bar, index) => (
                                <g key={`event-bar-${index}`}>
                                    <rect
                                        x={bar.x}
                                        y={bar.y}
                                        width={Math.max(12, (eventChartModel.innerWidth / Math.max(eventChartModel.bars.length, 1)) * 0.55)}
                                        height={bar.barHeight}
                                        rx="6"
                                        fill="#D94FAF"
                                        fillOpacity="0.85"
                                    />
                                </g>
                            ))}
                        </svg>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            {eventMonthlyData.map((month) => (
                                <span key={`event-label-${month.key}`}>{month.label}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-50 px-4 py-3 border border-emerald-100">
                            <p className="text-xs text-emerald-700 uppercase tracking-wide">Taux de validation</p>
                            <p className="text-xl font-bold text-emerald-800">{eventInsights.approvalRate}%</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 px-4 py-3 border border-amber-100">
                            <p className="text-xs text-amber-700 uppercase tracking-wide">Événements en attente</p>
                            <p className="text-xl font-bold text-amber-800">{eventInsights.pendingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Top événements inscrits</h2>
                        <Users className="w-4 h-4 text-fuchsia-600" />
                    </div>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {topEventsByParticipants.slice(0, 8).map((event, index) => (
                            <div
                                key={`${event.id}-${index}`}
                                className="flex items-center justify-between rounded-lg border border-fuchsia-100 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {index + 1}. {event.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Créé le {formatDateTime(event.dateMs)}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold text-fuchsia-700 whitespace-nowrap">
                                    {event.participants} inscrit(es)
                                </span>
                            </div>
                        ))}
                        {!isLoadingStats && topEventsByParticipants.length === 0 && (
                            <div className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500 text-center">
                                Aucun événement disponible.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Détail des payeuses</h2>
                        <p className="text-sm text-gray-500">
                            Tri actif: <span className="font-medium text-fuchsia-700">{rankingLabel}</span>
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {rankedProfiles.length} profil(s)
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-fuchsia-100">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Adhérente</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total versé</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Paiements</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">1er paiement</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dernier paiement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-fuchsia-100/70">
                            {rankedProfiles.slice(0, 12).map((profile, index) => (
                                <tr key={`${profile.key}-${index}`} className="hover:bg-fuchsia-50/40">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{profile.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatAmount(profile.totalAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{profile.paymentCount}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(profile.firstPaymentMs)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(profile.lastPaymentMs)}</td>
                                </tr>
                            ))}
                            {!isLoadingStats && rankedProfiles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        Aucune payeuse trouvée pour le filtre actuel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
