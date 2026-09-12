import { StyleSheet, View, Text } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 6,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
  },
});

export const DescriptionText = ({ text, color = '#333333' }: { text: string; color?: string }) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return (
    <View style={{ marginTop: 4 }}>
      {lines.map((line, idx) => {
        const isBullet = line.startsWith('-') || line.startsWith('*');
        const cleanLine = isBullet ? line.replace(/^[-*]\s*/, '') : line;
        
        if (isBullet) {
          return (
            <View key={idx} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color }]}>•</Text>
              <Text style={[styles.bulletText, { color }]}>{cleanLine}</Text>
            </View>
          );
        }
        return (
          <Text key={idx} style={{ fontSize: 9, lineHeight: 1.3, color, marginBottom: 2 }}>
            {cleanLine}
          </Text>
        );
      })}
    </View>
  );
};
