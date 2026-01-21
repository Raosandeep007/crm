import { useState, useEffect } from "react";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { initDatabase } from "./database";
import ContactsView from "./components/ContactsView";
import CompaniesView from "./components/CompaniesView";

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbInitialized(true);
        console.log("Database ready");
      })
      .catch((error) => {
        console.error("Failed to initialize database:", error);
      });
  }, []);

  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardBody>
            <p className="text-lg">Initializing CRM...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            CRM Desktop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your contacts and companies locally
          </p>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          size="lg"
          className="mb-6"
        >
          <Tab key="contacts" title="Contacts">
            <ContactsView />
          </Tab>
          <Tab key="companies" title="Companies">
            <CompaniesView />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
