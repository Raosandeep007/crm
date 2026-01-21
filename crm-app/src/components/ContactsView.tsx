import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
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

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex justify-between gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Button color="primary" onPress={() => onOpen()}>
            Add Contact
          </Button>
        </CardHeader>
        <CardBody>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts found. Add your first contact!
            </div>
          ) : (
            <Table aria-label="Contacts table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>COMPANY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    <TableCell>{contact.email || "N/A"}</TableCell>
                    <TableCell>{contact.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {getCompanyName(contact.company_id)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="default"
                          onPress={() => handleViewNotes(contact)}
                        >
                          Notes
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleEdit(contact)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => handleDelete(contact.id!)}
                        >
                          Delete
                        </Button>
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
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {selectedContact ? "Edit Contact" : "Add New Contact"}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                isRequired
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                isRequired
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                label="Phone"
                placeholder="Enter phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Select
                label="Company"
                placeholder="Select a company"
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
              >
                {companies.map((company) => (
                  <SelectItem key={company.id!.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!formData.first_name || !formData.last_name}
            >
              {selectedContact ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            Notes for {selectedContact?.first_name} {selectedContact?.last_name}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  minRows={2}
                />
                <Button color="primary" onPress={handleAddNote}>
                  Add
                </Button>
              </div>
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No notes yet. Add one above!
                  </div>
                ) : (
                  notes.map((note) => (
                    <Card key={note.id}>
                      <CardBody className="flex flex-row justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(note.created_at!).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleDeleteNote(note.id!)}
                        >
                          Delete
                        </Button>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onNotesClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
