import React from "react";
import { ScrollView, StyleSheet } from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CURRENCIES,
  Currency,
  DATE_FORMATS,
  DateFormat,
  FIRST_DAY_OPTIONS,
  FirstDayOfWeek,
  useSettingsStore,
} from "../../stores/settingsStore";

export default function SettingsScreen() {
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

  // Modal states
  const [showCurrencyModal, setShowCurrencyModal] = React.useState(false);
  const [showDateFormatModal, setShowDateFormatModal] = React.useState(false);
  const [showFirstDayModal, setShowFirstDayModal] = React.useState(false);

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyModal(false);
  };

  const handleDateFormatSelect = (selectedFormat: DateFormat) => {
    setDateFormat(selectedFormat);
    setShowDateFormatModal(false);
  };

  const handleFirstDaySelect = (selectedDay: FirstDayOfWeek) => {
    setFirstDayOfWeek(selectedDay);
    setShowFirstDayModal(false);
  };

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
            <Divider />
            <List.Item
              title="Currency"
              description={`${currency.name} (${currency.symbol})`}
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowCurrencyModal(true)}
            />
            <Divider />
            <List.Item
              title="Date Format"
              description={`${dateFormat.format} (${dateFormat.example})`}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowDateFormatModal(true)}
            />
            <Divider />
            <List.Item
              title="First Day of Week"
              description={firstDayOfWeek.name}
              left={(props) => <List.Icon {...props} icon="calendar-week" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowFirstDayModal(true)}
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

      {/* Currency Selection Modal */}
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
              const selectedCurrency = CURRENCIES.find((c) => c.code === value);
              if (selectedCurrency) handleCurrencySelect(selectedCurrency);
            }}
            value={currency.code}
          >
            {CURRENCIES.map((curr) => (
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

      {/* Date Format Selection Modal */}
      <Portal>
        <Modal
          visible={showDateFormatModal}
          onDismiss={() => setShowDateFormatModal(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Title style={styles.modalTitle}>Select Date Format</Title>
          <RadioButton.Group
            onValueChange={(value) => {
              const selectedFormat = DATE_FORMATS.find((f) => f.key === value);
              if (selectedFormat) handleDateFormatSelect(selectedFormat);
            }}
            value={dateFormat.key}
          >
            {DATE_FORMATS.map((format) => (
              <RadioButton.Item
                key={format.key}
                label={`${format.format} (${format.example})`}
                value={format.key}
                labelStyle={{ color: theme.colors.onSurface }}
              />
            ))}
          </RadioButton.Group>
          <Button
            mode="text"
            onPress={() => setShowDateFormatModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>

      {/* First Day of Week Selection Modal */}
      <Portal>
        <Modal
          visible={showFirstDayModal}
          onDismiss={() => setShowFirstDayModal(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Title style={styles.modalTitle}>Select First Day of Week</Title>
          <RadioButton.Group
            onValueChange={(value) => {
              const selectedDay = FIRST_DAY_OPTIONS.find(
                (d) => d.key === value
              );
              if (selectedDay) handleFirstDaySelect(selectedDay);
            }}
            value={firstDayOfWeek.key}
          >
            {FIRST_DAY_OPTIONS.map((day) => (
              <RadioButton.Item
                key={day.key}
                label={day.name}
                value={day.key}
                labelStyle={{ color: theme.colors.onSurface }}
              />
            ))}
          </RadioButton.Group>
          <Button
            mode="text"
            onPress={() => setShowFirstDayModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
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
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "80%",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 16,
    alignSelf: "center",
  },
});
