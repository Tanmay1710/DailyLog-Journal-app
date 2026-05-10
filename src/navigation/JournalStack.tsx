/**
 * Journal Stack Navigator
 * Main app navigation after user is authenticated
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalDetailScreen } from '@screens/JournalStack/JournalDetailScreen';
import { JournalListScreen } from '@screens/JournalStack/JournalListScreen';
import { NewJournalScreen } from '@screens/JournalStack/NewJournalScreen';
import { EntryLogScreen } from '@screens/JournalStack/EntryLogScreen';
import { EntryHistoryScreen } from '@screens/JournalStack/EntryHistoryScreen';

export type JournalStackParamList = {
  JournalList: undefined;
  NewJournal: undefined;
  JournalDetail: { journalId: string };
  EntryLog: { journalId: string };
  EntryHistory: { journalId: string };
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

export const JournalStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen
        name="JournalList"
        component={JournalListScreen}
        options={{
          title: 'My Journals',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="NewJournal"
        component={NewJournalScreen}
        options={{
          title: 'New Journal',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="JournalDetail"
        component={JournalDetailScreen}
        options={{
          title: 'Journal Details',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="EntryLog"
        component={EntryLogScreen}
        options={{
          title: 'Log Entry',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="EntryHistory"
        component={EntryHistoryScreen}
        options={{
          title: 'Entry History',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};
