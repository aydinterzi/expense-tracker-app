import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Divider, List, Title, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Card.Title style={styles.sectionTitle} title={"General"} />
            <List.Item
              title="Currency"
              description="USD ($)"
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Date Format"
              description="MM/DD/YYYY"
              left={(props) => <List.Icon {...props} icon="calendar" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="First Day of Week"
              description="Sunday"
              left={(props) => <List.Icon {...props} icon="calendar-week" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Categories & Accounts</Title>
            <List.Item
              title="Manage Categories"
              description="Add, edit, or delete categories"
              left={(props) => <List.Icon {...props} icon="tag" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Manage Accounts"
              description="Add, edit, or delete accounts"
              left={(props) => <List.Icon {...props} icon="bank" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data & Privacy</Title>
            <List.Item
              title="Export Data"
              description="Export your data to CSV"
              left={(props) => <List.Icon {...props} icon="download" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Import Data"
              description="Import data from CSV"
              left={(props) => <List.Icon {...props} icon="upload" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Clear All Data"
              description="Delete all transactions and accounts"
              left={(props) => <List.Icon {...props} icon="delete" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
