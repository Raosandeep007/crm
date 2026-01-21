import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Select,
  SelectItem,
  Textarea,
  Avatar,
  Tooltip,
} from "@heroui/react";
import {
  Contact,
  createContact,
  getContacts,
  updateContact,
  deleteContact,
  Company,
  getCompanies,
  Note,
  createNote,
  getNotesByContact,
  deleteNote,
} from "../database";

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const NotesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNotesOpen,
    onOpen: onNotesOpen,
    onClose: onNotesClose,
  } = useDisclosure();

  const [formData, setFormData] = useState<Contact>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_id: undefined,
  });

  useEffect(() => {
    loadContacts();
    loadCompanies();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedContact?.id) {
        await updateContact(selectedContact.id, formData);
      } else {
        await createContact(formData);
      }
      await loadContacts();
      handleClose();
    } catch (error) {
      console.error("Failed to save contact:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        await loadContacts();
      } catch (error) {
        console.error("Failed to delete contact:", error);
      }
    }
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || "",
      phone: contact.phone || "",
      company_id: contact.company_id,
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedContact(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company_id: undefined,
    });
    onClose();
  };

  const handleViewNotes = async (contact: Contact) => {
    setSelectedContact(contact);
    try {
      const contactNotes = await getNotesByContact(contact.id!);
      setNotes(contactNotes);
      setNewNote("");
      onNotesOpen();
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedContact?.id) return;

    try {
      await createNote({
        contact_id: selectedContact.id,
        content: newNote,
      });
      const contactNotes = await getNotesByContact(selectedContact.id);
      setNotes(contactNotes);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      if (selectedContact?.id) {
        const contactNotes = await getNotesByContact(selectedContact.id);
        setNotes(contactNotes);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getCompanyName = (companyId?: number) => {
    if (!companyId) return "N/A";
    const company = companies.find((c) => c.id === companyId);
    return company?.name || "N/A";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Card className="w-full shadow-lg border border-divider bg-content1">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Contacts</h2>
              <p className="text-sm text-default-500 mt-1">
                {contacts.length} total contact{contacts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<SearchIcon />}
                className="w-full sm:w-72"
                classNames={{
                  inputWrapper: "bg-default-100 border-none shadow-sm",
                }}
              />
              <Button
                color="primary"
                onPress={() => onOpen()}
                startContent={<PlusIcon />}
                className="font-medium shadow-md"
              >
                Add Contact
              </Button>
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-default-400">
              <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mb-4">
                <UserIcon />
              </div>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-sm mt-1">Add your first contact to get started!</p>
            </div>
          ) : (
            <Table
              aria-label="Contacts table"
              classNames={{
                wrapper: "shadow-none p-0",
                th: "bg-default-100 text-default-600 font-semibold",
                td: "py-4",
              }}
            >
              <TableHeader>
                <TableColumn>CONTACT</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>COMPANY</TableColumn>
                <TableColumn align="center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-default-100 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={getInitials(contact.first_name, contact.last_name)}
                          size="sm"
                          classNames={{
                            base: "bg-gradient-to-br from-primary-400 to-primary-600",
                            name: "text-white font-semibold text-xs",
                          }}
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {contact.first_name} {contact.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-default-600">
                        {contact.email || <span className="text-default-400">-</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-default-600">
                        {contact.phone || <span className="text-default-400">-</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      {contact.company_id ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                        >
                          {getCompanyName(contact.company_id)}
                        </Chip>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Tooltip content="View Notes">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleViewNotes(contact)}
                            className="text-default-500 hover:text-primary"
                          >
                            <NotesIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEdit(contact)}
                            className="text-default-500 hover:text-success"
                          >
                            <EditIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete" color="danger">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleDelete(contact.id!)}
                            className="text-default-500 hover:text-danger"
                          >
                            <TrashIcon />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Contact Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        classNames={{
          base: "bg-content1",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="text-xl font-bold">
              {selectedContact ? "Edit Contact" : "Add New Contact"}
            </span>
            <span className="text-sm font-normal text-default-500">
              {selectedContact ? "Update contact information" : "Fill in the details below"}
            </span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper: "border-default-300",
                }}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper: "border-default-300",
                }}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              variant="bordered"
              classNames={{
                inputWrapper: "border-default-300",
              }}
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              variant="bordered"
              classNames={{
                inputWrapper: "border-default-300",
              }}
            />
            <Select
              label="Company"
              placeholder="Select a company"
              variant="bordered"
              selectedKeys={
                formData.company_id ? [formData.company_id.toString()] : []
              }
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setFormData({
                  ...formData,
                  company_id: selectedKey ? parseInt(selectedKey) : undefined,
                });
              }}
              classNames={{
                trigger: "border-default-300",
              }}
            >
              {companies.map((company) => (
                <SelectItem key={company.id!.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!formData.first_name || !formData.last_name}
              className="font-medium"
            >
              {selectedContact ? "Save Changes" : "Create Contact"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={isNotesOpen}
        onClose={onNotesClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-content1",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Avatar
                name={getInitials(selectedContact?.first_name || "", selectedContact?.last_name || "")}
                size="sm"
                classNames={{
                  base: "bg-gradient-to-br from-primary-400 to-primary-600",
                  name: "text-white font-semibold text-xs",
                }}
              />
              <div>
                <span className="text-lg font-bold">
                  {selectedContact?.first_name} {selectedContact?.last_name}
                </span>
                <p className="text-sm font-normal text-default-500">
                  {notes.length} note{notes.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Write a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  minRows={2}
                  variant="bordered"
                  className="flex-1"
                  classNames={{
                    inputWrapper: "border-default-300",
                  }}
                />
                <Button
                  color="primary"
                  onPress={handleAddNote}
                  isDisabled={!newNote.trim()}
                  className="self-end font-medium"
                >
                  Add Note
                </Button>
              </div>
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-default-400">
                    <NotesIcon />
                    <p className="mt-2">No notes yet</p>
                    <p className="text-sm">Add your first note above!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <Card
                      key={note.id}
                      className="border border-divider shadow-sm"
                    >
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {note.content}
                            </p>
                            <p className="text-xs text-default-400 mt-3">
                              {new Date(note.created_at!).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Tooltip content="Delete note" color="danger">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleDeleteNote(note.id!)}
                              className="text-default-400 hover:text-danger"
                            >
                              <TrashIcon />
                            </Button>
                          </Tooltip>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onNotesClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
