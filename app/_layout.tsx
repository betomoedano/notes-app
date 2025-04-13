import { useFrameworkReady } from '@/hooks/useFrameworkReady'
import { Stack } from 'expo-router'
import { type SQLiteDatabase, SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DB_NAME, NotesProvider, tursoOptions } from '../context/NotesContext'

export default function RootLayout() {
  useFrameworkReady()

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
        try {
          // Always sync libSQL first to prevent conflicts between local and remote databases
          db.syncLibSQL()
        } catch (e) {
          console.error('Error onInit syncing libSQL:', e)
        }

        // Define the target database version.
        const databaseVersion = 1

        // PRAGMA is a special command in SQLite used to query or modify database settings. For example, PRAGMA user_version retrieves or sets a custom schema version number, helping you track migrations.
        // Retrieve the current database version using PRAGMA.
        const result = await db.getFirstAsync<{
          user_version: number
        } | null>('PRAGMA user_version')
        let currentDbVersion = result?.user_version ?? 0

        // If the current version is already equal or newer, no migration is needed.
        if (currentDbVersion >= databaseVersion) {
          console.log('No migration needed, DB version:', currentDbVersion)
          return
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
            'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY NOT NULL, title TEXT, content TEXT, modifiedDate TEXT);',
          )
          console.log('Initial migration applied, DB version:', databaseVersion)
          // Update the current version after applying the initial migration.
          currentDbVersion = 1
        } else {
          console.log('DB version:', currentDbVersion)
        }

        // Future migrations for later versions can be added here.
        // Example:
        // if (currentDbVersion === 1) {
        //   // Add migration steps for upgrading from version 1 to a higher version.
        // }

        // Set the database version to the target version after migration.
        await db.execAsync(`PRAGMA user_version = ${databaseVersion}`)
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
            <Stack.Screen
              name="note/[id]"
              options={{
                headerShown: true,
              }}
            />
          </Stack>
          <StatusBar barStyle={'dark-content'} />
        </GestureHandlerRootView>
      </NotesProvider>
    </SQLiteProvider>
  )
}
