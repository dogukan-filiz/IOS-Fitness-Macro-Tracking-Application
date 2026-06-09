import { StyleSheet, Text, View } from 'react-native';

export type InlineMessageType = 'error' | 'success';

export type InlineMessageProps = {
  type: InlineMessageType;
  text: string;
};

/**
 * Cross-platform feedback banner.
 *
 * Replaces `Alert.alert`, which is a no-op on react-native-web and left web
 * users without any feedback. Renders an inline error/success message that
 * works the same on web and native.
 */
export default function InlineMessage({ type, text }: InlineMessageProps) {
  const isError = type === 'error';
  return (
    <View style={[styles.banner, isError ? styles.error : styles.success]}>
      <Text style={[styles.text, isError ? styles.textError : styles.textSuccess]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  success: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
  },
  textError: {
    color: '#b91c1c',
  },
  textSuccess: {
    color: '#166534',
  },
});
