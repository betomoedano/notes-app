import { Stack, useRouter } from 'expo-router'
import { Plus, Search, X } from 'lucide-react-native'
import { useState } from 'react'
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SwipeableNote } from '../components/SwipeableNote'
import { useNotes } from '../context/NotesContext'

export default function NotesScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { notes, createNote, deleteNote, isSyncing, toggleSync, syncNotes } =
    useNotes()

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateNote = async () => {
    console.log('Creating note...')
    const newNote = await createNote()
    if (newNote) {
      router.push(`/note/${newNote.id}`)
    } else {
      alert('Failed to create note')
    }
  }

  const renderNote = ({ item }: any) => (
    <SwipeableNote
      note={item}
      onPress={() => router.push(`/note/${item.id}`)}
      onDelete={() => deleteNote(item.id)}
    />
  )
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* <Text style={{ fontSize: 16 }}>Sync</Text> */}
              {/* <Switch
                value={isSyncing}
                onValueChange={() => {
                  // toggleSync(!isSyncing);
                  
                }}
              /> */}
              <Button title="Pull" onPress={() => syncNotes()} />
            </View>
          ),
        }}
      />
      <Animated.View entering={FadeIn} style={styles.notesList}>
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={20} color="#8E8E93" />
                  </Pressable>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="automatic"
        />
        <Pressable style={styles.fab} onPress={handleCreateNote}>
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  notesList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100, // Extra padding for FAB
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
