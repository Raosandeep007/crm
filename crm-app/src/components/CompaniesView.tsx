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
  Textarea,
} from "@heroui/react";
import {
  Company,
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  Note,
  createNote,
  getNotesByCompany,
  deleteNote,
} from "../database";

export default function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNotesOpen,
    onOpen: onNotesOpen,
    onClose: onNotesClose,
  } = useDisclosure();

  const [formData, setFormData] = useState<Company>({
    name: "",
    industry: "",
    website: "",
    phone: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

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
      if (selectedCompany?.id) {
        await updateCompany(selectedCompany.id, formData);
      } else {
        await createCompany(formData);
      }
      await loadCompanies();
      handleClose();
    } catch (error) {
      console.error("Failed to save company:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(id);
        await loadCompanies();
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || "",
      website: company.website || "",
      phone: company.phone || "",
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedCompany(null);
    setFormData({
      name: "",
      industry: "",
      website: "",
      phone: "",
    });
    onClose();
  };

  const handleViewNotes = async (company: Company) => {
    setSelectedCompany(company);
    try {
      const companyNotes = await getNotesByCompany(company.id!);
      setNotes(companyNotes);
      setNewNote("");
      onNotesOpen();
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCompany?.id) return;

    try {
      await createNote({
        company_id: selectedCompany.id,
        content: newNote,
      });
      const companyNotes = await getNotesByCompany(selectedCompany.id);
      setNotes(companyNotes);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteNote(noteId);
      if (selectedCompany?.id) {
        const companyNotes = await getNotesByCompany(selectedCompany.id);
        setNotes(companyNotes);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      company.industry?.toLowerCase().includes(searchLower) ||
      company.website?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex justify-between gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Button color="primary" onPress={() => onOpen()}>
            Add Company
          </Button>
        </CardHeader>
        <CardBody>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No companies found. Add your first company!
            </div>
          ) : (
            <Table aria-label="Companies table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>INDUSTRY</TableColumn>
                <TableColumn>WEBSITE</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.industry || "N/A"}</TableCell>
                    <TableCell>{company.website || "N/A"}</TableCell>
                    <TableCell>{company.phone || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="default"
                          onPress={() => handleViewNotes(company)}
                        >
                          Notes
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleEdit(company)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onPress={() => handleDelete(company.id!)}
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

      {/* Add/Edit Company Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {selectedCompany ? "Edit Company" : "Add New Company"}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Company Name"
                placeholder="Enter company name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isRequired
              />
              <Input
                label="Industry"
                placeholder="Enter industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
              />
              <Input
                label="Website"
                type="url"
                placeholder="Enter website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
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
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!formData.name}
            >
              {selectedCompany ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={isNotesOpen} onClose={onNotesClose} size="2xl">
        <ModalContent>
          <ModalHeader>Notes for {selectedCompany?.name}</ModalHeader>
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
