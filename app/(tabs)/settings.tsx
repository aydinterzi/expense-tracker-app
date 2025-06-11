import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  Modal,
  Portal,
  RadioButton,
  Switch,
  Title,
  useTheme,
} from "react-native-paper";

import { useSettingsStore } from "../../stores/settingsStore";
import {
  clearAllData,
  exportDataToJSON,
  importDataFromJSON,
  shareExportedFile,
} from "../../utils/export";

export default function Settings() {
  const theme = useTheme();
  const {
    isDarkMode,
    currency,
    dateFormat,
    firstDayOfWeek,
    setDarkMode,
    setCurrency,
    setDateFormat,
    setFirstDayOfWeek,
  } = useSettingsStore();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleExportData = async () => {
    try {
      const filePath = await exportDataToJSON();
      await shareExportedFile(filePath);
      Alert.alert("Success", "Data exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        Alert.alert(
          "Import Data",
          "This will replace all your current data. Are you sure?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Import",
              style: "destructive",
              onPress: async () => {
                try {
                  await importDataFromJSON(result.assets[0].uri);
                  Alert.alert("Success", "Data imported successfully!");
                } catch (error) {
                  Alert.alert(
                    "Error",
                    "Failed to import data. Please check the file format."
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select file. Please try again.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your transactions, budgets, and accounts. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "GBP", name: "British Pound", symbol: "£" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Appearance Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Appearance</Title>
          <List.Item
            title="Dark Theme"
            description={
              isDarkMode ? "Dark mode enabled" : "Light mode enabled"
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon={isDarkMode ? "weather-night" : "weather-sunny"}
              />
            )}
            right={() => (
              <Switch value={isDarkMode} onValueChange={setDarkMode} />
            )}
          />
        </Card.Content>
      </Card>

      {/* Currency Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Currency</Title>
          <List.Item
            title="Currency"
            description={`${currency.name} (${currency.symbol})`}
            left={(props) => <List.Icon {...props} icon="currency-usd" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowCurrencyModal(true)}
          />
        </Card.Content>
      </Card>

      {/* Data Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Data & Privacy</Title>
          <List.Item
            title="Export Data"
            description="Backup all your data"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleExportData}
          />
          <Divider />
          <List.Item
            title="Import Data"
            description="Restore from backup"
            left={(props) => <List.Icon {...props} icon="upload" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleImportData}
          />
          <Divider />
          <List.Item
            title="Clear All Data"
            description="Delete all transactions and accounts"
            left={(props) => <List.Icon {...props} icon="delete" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearData}
          />
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>About</Title>
          <List.Item
            title="Version"
            description="SpendTrack v1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Send Feedback"
            description="Share your suggestions with us"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log("Feedback")}
          />
        </Card.Content>
      </Card>

      {/* Currency Modal */}
      <Portal>
        <Modal
          visible={showCurrencyModal}
          onDismiss={() => setShowCurrencyModal(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Title style={styles.modalTitle}>Select Currency</Title>
          <RadioButton.Group
            onValueChange={(value) => {
              const selectedCurrency = currencies.find((c) => c.code === value);
              if (selectedCurrency) {
                setCurrency(selectedCurrency);
                setShowCurrencyModal(false);
              }
            }}
            value={currency.code}
          >
            {currencies.map((curr) => (
              <RadioButton.Item
                key={curr.code}
                label={`${curr.name} (${curr.symbol})`}
                value={curr.code}
                labelStyle={{ color: theme.colors.onSurface }}
              />
            ))}
          </RadioButton.Group>
          <Button
            mode="text"
            onPress={() => setShowCurrencyModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 16,
    alignSelf: "center",
  },
});
