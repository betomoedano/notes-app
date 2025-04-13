import { format } from 'date-fns'
import { Trash2 } from 'lucide-react-native'
import { LogBox, Pressable, StyleSheet, Text, View } from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import Reanimated, {
  type SharedValue,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
  LinearTransition,
  configureReanimatedLogger,
} from 'react-native-reanimated'

LogBox.ignoreAllLogs() // YOLO
configureReanimatedLogger({ strict: false }) // YOLO

interface Note {
  id: string
  title: string
  content: string
  modifiedDate: Date
}

interface Props {
  note: Note
  onPress: () => void
  onDelete: () => void
}

export function SwipeableNote({ note, onPress, onDelete }: Props) {
  const RightAction = (
    prog: SharedValue<number>,
    drag: SharedValue<number>,
  ) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 60 }],
      }
    })

    return (
      <Pressable
        onPress={() => {
          onDelete()
        }}
      >
        <Reanimated.View style={[styleAnimation, styles.rightAction]}>
          <Trash2 size={24} color="red" />
        </Reanimated.View>
      </Pressable>
    )
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition}
    >
      <ReanimatedSwipeable
        key={note.id}
        friction={2}
        enableTrackpadTwoFingerGesture={true}
        rightThreshold={40}
        renderRightActions={RightAction}
        overshootRight={false}
        enableContextMenu={true}
        containerStyle={{
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <Pressable
          onPress={() => {
            onPress()
          }}
          style={styles.swipeable}
        >
          <View style={styles.content}>
            <Text style={styles.noteTitle}>
              {note.title || 'Untitled Note'}
            </Text>
            <Text style={styles.noteDate}>
              {format(note.modifiedDate || new Date(), 'MMM d, yyyy')}
            </Text>
            <Text style={styles.notePreview} numberOfLines={2}>
              {note.content || 'No additional text'}
            </Text>
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    </Reanimated.View>
  )
}

const styles = StyleSheet.create({
  swipeable: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  },
  rightAction: {
    width: 60,
    height: '100%',
    paddingBottom: 12,
    paddingRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 15,
    color: '#3C3C43',
    opacity: 0.6,
  },
})
