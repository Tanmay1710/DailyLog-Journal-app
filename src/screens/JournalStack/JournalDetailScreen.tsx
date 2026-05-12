/**
 * JournalDetailScreen
 *
 * Control center for one journal — wireframe-aligned (Wireframe 3).
 * Features: hero card with streak + entry count metric badge, last entry timestamp,
 * Log Today + History buttons, schema list with type badges, reminder context card,
 * overflow menu (Edit/Archive/Delete).
 */

import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import type { Entry, Journal } from '@app-types';
import type { JournalStackParamList } from '@navigation/JournalStack';
import { journalService } from '@services/journalService';
import { entryService } from '@services/entryService';
import { HeroCard } from '@components/Common/HeroCard';
import { MetricBadge } from '@components/Common/MetricBadge';
import { Button } from '@components/Common/Button';
import { IconButton } from '@components/Common/IconButton';
import { InlineBanner } from '@components/Common/InlineBanner';
import { LoadingSkeleton } from '@components/Common/LoadingSkeleton';
import { lightColors } from '@constants/colors';
import { radii, shadows } from '@constants/layout';

type JournalDetailRouteProp = RouteProp<JournalStackParamList, 'JournalDetail'>;
type JournalDetailNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'JournalDetail'>;

export function JournalDetailScreen(): JSX.Element {
  const route = useRoute<JournalDetailRouteProp>();
  const navigation = useNavigation<JournalDetailNavigationProp>();
  const { user } = useAuth();
  const { journalId } = route.params;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJournal = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await journalService.getJournal(journalId);

      if (user?.id && data.userId !== user.id) {
        setError('You do not have permission to view this journal.');
        setJournal(null);
        return;
      }

      setJournal(data);
    } catch {
      setError('Failed to load journal details.');
      setJournal(null);
    } finally {
      setIsLoading(false);
    }
  }, [journalId, user?.id]);

  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      const data = await entryService.getEntries(journalId);
      setEntries(data);
    } catch {
      setEntries([]);
    }
  }, [journalId]);

  const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(entries.map((entry) => entry.entryDate));
    let streak = 0;
    let current = parseDateString(entries[0].entryDate);
    while (entryDates.has(formatDateString(current))) {
      streak += 1;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }, [entries]);

  /** Format last entry timestamp for display */
  const lastEntryTime = useMemo(() => {
    if (entries.length === 0) return null;
    const lastEntry = entries[0];
    const date = lastEntry.createdAt;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);

    if (diffHrs < 24) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffHrs < 48) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [entries]);

  useFocusEffect(
    useCallback(() => {
      void loadJournal();
      void loadEntries();
    }, [loadJournal, loadEntries])
  );

  /** Set header overflow button */
  useFocusEffect(
    useCallback(() => {
      const handleArchive = (): void => {
        Alert.alert('Archive Journal', 'Are you sure you want to archive this journal?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: () => {
              void (async (): Promise<void> => {
                try {
                  await journalService.archiveJournal(journalId);
                  Alert.alert('Archived', 'Journal archived successfully.');
                  navigation.goBack();
                } catch {
                  Alert.alert('Archive Failed', 'Could not archive journal. Please try again.');
                }
              })();
            },
          },
        ]);
      };

      const handleDelete = (): void => {
        Alert.alert('Delete Journal', 'This will permanently delete this journal and all its entries. Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async (): Promise<void> => {
                try {
                  await journalService.deleteJournal(journalId);
                  Alert.alert('Deleted', 'Journal deleted successfully.');
                  navigation.goBack();
                } catch {
                  Alert.alert('Delete Failed', 'Could not delete journal. Please try again.');
                }
              })();
            },
          },
        ]);
      };

      const handleOverflow = (): void => {
        Alert.alert('Journal Options', '', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit Journal', onPress: () => Alert.alert('Coming Soon', 'Journal editing will be available in a future update.') },
          { text: 'Archive', style: 'destructive', onPress: handleArchive },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ]);
      };
      
      navigation.setOptions({
        headerRight: () => (
          <IconButton icon="⋯" label="Journal options" onPress={handleOverflow} />
        ),
      });
    }, [navigation, journalId])
  );

  const handleLogEntry = (): void => {
    navigation.navigate('EntryLog', { journalId });
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, padding: 16 }}>
        <LoadingSkeleton card />
        <View style={{ height: 16 }} />
        <LoadingSkeleton card />
        <View style={{ height: 16 }} />
        <LoadingSkeleton card />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <InlineBanner message={error} variant="danger" />
        <View style={{ marginTop: 16 }}>
          <Button title="Retry" onPress={() => void loadJournal()} />
        </View>
      </View>
    );
  }

  // Not found
  if (!journal) {
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: lightColors.muted }}>Journal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: lightColors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
    >
      {/* Hero Card with streak + entry count */}
      <HeroCard
        sectionLabel="Journal summary"
        title={`${currentStreak} day streak${currentStreak === 1 ? '' : ''}`}
        subtitle={lastEntryTime ? `Last entry ${lastEntryTime}` : 'No entries yet'}
        metric={
          <MetricBadge label="Entries" value={entries.length.toString()} />
        }
      >
        {/* Emoji + description inside hero */}
        {journal.emoji ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 18 }}>{journal.emoji}</Text>
            {journal.description ? (
              <Text style={{ fontSize: 13, color: lightColors.muted, flex: 1 }}>{journal.description}</Text>
            ) : null}
          </View>
        ) : null}
      </HeroCard>

      {/* Action buttons: Log Today + History */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Button title="Log Today" onPress={handleLogEntry} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="History"
            variant="secondary"
            onPress={() => navigation.navigate('EntryHistory', { journalId })}
          />
        </View>
      </View>

      {/* Schema list */}
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: lightColors.surface,
          borderWidth: 1,
          borderColor: lightColors.line,
          padding: 14,
          marginBottom: 16,
          ...shadows.card,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: lightColors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          Schema
        </Text>

        {journal.fieldSchema.length === 0 ? (
          <Text style={{ fontSize: 14, color: lightColors.muted }}>No custom fields configured.</Text>
        ) : (
          journal.fieldSchema.map((field, index) => (
            <View
              key={field.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: lightColors.line,
              }}
            >
              <Text style={{ fontSize: 14, color: lightColors.text, flex: 1 }}>{field.label}</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {field.type === 'multiChoice' && field.options?.length ? (
                  <Text style={{ fontSize: 11, color: lightColors.muted }}>{field.options.length} options</Text>
                ) : null}
                <View
                  style={{
                    borderRadius: radii.full,
                    backgroundColor: lightColors.surface2,
                    borderWidth: 1,
                    borderColor: lightColors.line,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, color: lightColors.muted, fontWeight: '500' }}>
                    {field.type === 'multiChoice' ? 'Multi-choice' : field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Reminder context card */}
      {journal.userId ? (
        <View
          style={{
            borderRadius: radii.lg,
            backgroundColor: lightColors.surface,
            borderWidth: 1,
            borderColor: lightColors.line,
            padding: 14,
            marginBottom: 16,
            ...shadows.card,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: lightColors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Reminder
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: lightColors.text }}>Daily reminder</Text>
            <View
              style={{
                borderRadius: radii.full,
                backgroundColor: lightColors.accentSoft,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 12, color: lightColors.accent, fontWeight: '600' }}>
                {user?.reminderTime || '7:30 PM'}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Streak fire emoji for active streaks */}
      {currentStreak > 0 ? (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 32 }}>🔥</Text>
          <Text style={{ fontSize: 13, color: lightColors.muted, marginTop: 4 }}>
            {currentStreak} day streak — keep it going!
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
