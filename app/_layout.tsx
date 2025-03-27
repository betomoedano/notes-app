import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DB_NAME, NotesProvider, tursoOptions } from '../context/NotesContext';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SQLiteProvider
      databaseName={DB_NAME}
      options={{
        libSQLOptions: {
          url: tursoOptions.url,
          authToken: tursoOptions.authToken,
        },
      }}
      onInit={async (db: SQLiteDatabase) => {
        // Always sync libSQL first to prevent conflicts between local and remote databases
        db.syncLibSQL();

        // Define the target database version.
        const DATABASE_VERSION = 1;

        // PRAGMA is a special command in SQLite used to query or modify database settings. For example, PRAGMA user_version retrieves or sets a custom schema version number, helping you track migrations.
        // Retrieve the current database version using PRAGMA.
        let result = await db.getFirstAsync<{
          user_version: number;
        } | null>('PRAGMA user_version');
        let currentDbVersion = result?.user_version ?? 0;

        // If the current version is already equal or newer, no migration is needed.
        if (currentDbVersion >= DATABASE_VERSION) {
          return;
        }

        // For a new or uninitialized database (version 0), apply the initial migration.
        if (currentDbVersion === 0) {
          // Note: libSQL does not support WAL (Write-Ahead Logging) mode.
          // await db.execAsync(`PRAGMA journal_mode = 'wal';`);

          // Create the 'notes' table with three columns:
          // - id: an integer primary key that cannot be null.
          // - title: a text column.
          // - content: a text column.
          // - modifiedDate: a text column.
          await db.execAsync(
            `CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY NOT NULL, title TEXT, content TEXT, modifiedDate TEXT);`
          );
          // Update the current version after applying the initial migration.
          currentDbVersion = 1;
        }

        // Future migrations for later versions can be added here.
        // Example:
        // if (currentDbVersion === 1) {
        //   // Add migration steps for upgrading from version 1 to a higher version.
        // }

        // Set the database version to the target version after migration.
        await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
      }}
    >
      <NotesProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: true,
                headerLargeTitle: true,
                headerTitle: 'Notes',
              }}
            />
            <Stack.Screen name="note/[id]" />
          </Stack>
        </GestureHandlerRootView>
      </NotesProvider>
    </SQLiteProvider>
  );
}
