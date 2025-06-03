import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, List, Paragraph, Title } from "react-native-paper";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Settings</Title>
        </View>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account Management</Title>
            <List.Item
              title="Manage Categories"
              description="Add, edit, or delete expense and income categories"
              left={(props) => <List.Icon {...props} icon="tag" />}
              onPress={() => router.push("/categories")}
            />
            <Divider />
            <List.Item
              title="Manage Accounts"
              description="Add, edit, or delete your financial accounts"
              left={(props) => <List.Icon {...props} icon="wallet" />}
              onPress={() => router.push("/accounts")}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Data Management</Title>
            <List.Item
              title="Export Data"
              description="Export your transactions and data"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={() => {
                // TODO: Implement data export
                console.log("Export data");
              }}
            />
            <Divider />
            <List.Item
              title="Import Data"
              description="Import transactions from CSV or other formats"
              left={(props) => <List.Icon {...props} icon="upload" />}
              onPress={() => {
                // TODO: Implement data import
                console.log("Import data");
              }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>App Information</Title>
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="About"
              description="Expense Tracker - Personal Finance Management"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Stats</Title>
            <Paragraph style={styles.statsText}>
              This is a local-first expense tracking app built with Expo and
              React Native. All your data is stored securely on your device.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionCard: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  statsText: {
    lineHeight: 20,
    opacity: 0.8,
  },
});
