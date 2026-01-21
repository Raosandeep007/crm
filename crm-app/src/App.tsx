import { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Spinner,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { initDatabase } from "./database";
import ContactsView from "./components/ContactsView";
import CompaniesView from "./components/CompaniesView";

// Icons
const SunIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BuildingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

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
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Card className="shadow-xl">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <Spinner size="lg" color="primary" />
            <p className="text-lg font-medium text-foreground">
              Initializing CRM...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar
        maxWidth="full"
        className="bg-content1/80 backdrop-blur-md border-b border-divider"
      >
        <NavbarBrand>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <p className="font-bold text-xl text-foreground">CRM Desktop</p>
              <p className="text-xs text-default-500">
                Manage contacts locally
              </p>
            </div>
          </div>
        </NavbarBrand>

        <NavbarContent justify="center">
          <NavbarItem>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              variant="solid"
              radius="full"
              classNames={{
                tabList: "bg-default-100 p-1",
                cursor: "bg-content1 shadow-md",
                tab: "px-6 h-10",
                tabContent:
                  "group-data-[selected=true]:text-primary font-medium",
              }}
            >
              <Tab
                key="contacts"
                title={
                  <div className="flex items-center gap-2">
                    <UsersIcon />
                    <span>Contacts</span>
                  </div>
                }
              />
              <Tab
                key="companies"
                title={
                  <div className="flex items-center gap-2">
                    <BuildingIcon />
                    <span>Companies</span>
                  </div>
                }
              />
            </Tabs>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              onPress={() => setIsDark(!isDark)}
              className="text-default-600"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="animate-in fade-in duration-500">
          {activeTab === "contacts" ? <ContactsView /> : <CompaniesView />}
        </div>
      </main>
    </div>
  );
}

export default App;
