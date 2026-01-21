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
  Textarea,
  Avatar,
  Tooltip,
  Chip,
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

const BuildingIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

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

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <Card className="w-full shadow-lg border border-divider bg-content1">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Companies</h2>
              <p className="text-sm text-default-500 mt-1">
                {companies.length} total compan{companies.length !== 1 ? "ies" : "y"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search companies..."
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
                Add Company
              </Button>
            </div>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-default-400">
              <div className="w-20 h-20 rounded-full bg-default-100 flex items-center justify-center mb-4">
                <BuildingIcon />
              </div>
              <p className="text-lg font-medium">No companies found</p>
              <p className="text-sm mt-1">Add your first company to get started!</p>
            </div>
          ) : (
            <Table
              aria-label="Companies table"
              classNames={{
                wrapper: "shadow-none p-0",
                th: "bg-default-100 text-default-600 font-semibold",
                td: "py-4",
              }}
            >
              <TableHeader>
                <TableColumn>COMPANY</TableColumn>
                <TableColumn>INDUSTRY</TableColumn>
                <TableColumn>WEBSITE</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn align="center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-default-100 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={getInitials(company.name)}
                          size="sm"
                          classNames={{
                            base: "bg-gradient-to-br from-success-400 to-success-600",
                            name: "text-white font-semibold text-xs",
                          }}
                        />
                        <p className="font-medium text-foreground">
                          {company.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.industry ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "bg-secondary-100",
                            content: "text-secondary-600 font-medium",
                          }}
                        >
                          {company.industry}
                        </Chip>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.website ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <GlobeIcon />
                          <span className="text-sm">{company.website}</span>
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-default-600">
                        {company.phone || <span className="text-default-400">-</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Tooltip content="View Notes">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleViewNotes(company)}
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
                            onPress={() => handleEdit(company)}
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
                            onPress={() => handleDelete(company.id!)}
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

      {/* Add/Edit Company Modal */}
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
              {selectedCompany ? "Edit Company" : "Add New Company"}
            </span>
            <span className="text-sm font-normal text-default-500">
              {selectedCompany ? "Update company information" : "Fill in the details below"}
            </span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex flex-col gap-4">
              <Input
                label="Company Name"
                placeholder="Acme Inc."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper: "border-default-300",
                }}
              />
              <Input
                label="Industry"
                placeholder="Technology, Finance, Healthcare..."
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                variant="bordered"
                classNames={{
                  inputWrapper: "border-default-300",
                }}
              />
              <Input
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
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
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!formData.name}
              className="font-medium"
            >
              {selectedCompany ? "Save Changes" : "Create Company"}
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
                name={getInitials(selectedCompany?.name || "")}
                size="sm"
                classNames={{
                  base: "bg-gradient-to-br from-success-400 to-success-600",
                  name: "text-white font-semibold text-xs",
                }}
              />
              <div>
                <span className="text-lg font-bold">
                  {selectedCompany?.name}
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
