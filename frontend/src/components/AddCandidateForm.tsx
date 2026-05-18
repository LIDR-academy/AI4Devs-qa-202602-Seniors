import React, { useState } from 'react';
import { Form, Button, Alert, FormControl, Card, Container, Row, Col } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import FileUploader from './FileUploader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCandidate, CvFilePayload, CandidatePayload } from '../services/candidateApi';

interface Education {
  institution: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface WorkExperience {
  company: string;
  position: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface CandidateState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  educations: Education[];
  workExperiences: WorkExperience[];
  cv: CvFilePayload | null;
}

type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const AddCandidateForm: React.FC = () => {
  const [candidate, setCandidate] = useState<CandidateState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    educations: [],
    workExperiences: [],
    cv: null,
  });
  const [error, setError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (
    e: FormChangeEvent,
    index: number,
    section: 'educations' | 'workExperiences'
  ) => {
    const updatedSection = [...candidate[section]];
    if (updatedSection[index]) {
      const target = e.target as HTMLInputElement;
      const item = updatedSection[index] as unknown as Record<string, string>;
      item[target.name] = target.value;
      setCandidate({ ...candidate, [section]: updatedSection });
    }
  };

  const handleDateChange = (
    date: Date | null,
    index: number,
    section: 'educations' | 'workExperiences',
    field: 'startDate' | 'endDate'
  ) => {
    const updatedSection = [...candidate[section]];
    if (updatedSection[index]) {
      updatedSection[index][field] = date;
      setCandidate({ ...candidate, [section]: updatedSection });
    }
  };

  const handleAddSection = (section: 'educations' | 'workExperiences') => {
    const newSection =
      section === 'educations'
        ? { institution: '', title: '', startDate: null as Date | null, endDate: null as Date | null }
        : { company: '', position: '', description: '', startDate: null as Date | null, endDate: null as Date | null };
    setCandidate({ ...candidate, [section]: [...candidate[section], newSection] });
  };

  const handleRemoveSection = (index: number, section: 'educations' | 'workExperiences') => {
    const updatedSection = [...candidate[section]];
    updatedSection.splice(index, 1);
    setCandidate({ ...candidate, [section]: updatedSection });
  };

  const handleCVUpload = (fileData: CvFilePayload) => {
    setCandidate({ ...candidate, cv: fileData });
    setUploadError(''); // Clear any previous upload error
  };

  const handleCVUploadError = (errorMessage: string) => {
    setUploadError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors at start of submission
    setError('');
    setSuccessMessage('');

    try {
      const candidateData: CandidatePayload = {
        ...candidate,
        cv: candidate.cv,
        educations: candidate.educations.map((education) => ({
          institution: education.institution,
          title: education.title,
          startDate: education.startDate ? education.startDate.toISOString().slice(0, 10) : '',
          endDate: education.endDate ? education.endDate.toISOString().slice(0, 10) : '',
        })),
        workExperiences: candidate.workExperiences.map((experience) => ({
          company: experience.company,
          position: experience.position,
          description: experience.description,
          startDate: experience.startDate ? experience.startDate.toISOString().slice(0, 10) : '',
          endDate: experience.endDate ? experience.endDate.toISOString().slice(0, 10) : '',
        })),
      };

      await createCandidate(candidateData);
      setSuccessMessage('Candidato añadido con éxito');
      // Reset form
      setCandidate({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        educations: [],
        workExperiences: [],
        cv: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al añadir candidato';
      setError(errorMessage);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Agregar Candidato</h1>
      <Card className="shadow p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="firstName">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  required
                  value={candidate.firstName}
                  onChange={(e) => setCandidate({ ...candidate, firstName: e.target.value })}
                  className="form-control shadow-sm"
                />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  required
                  value={candidate.lastName}
                  onChange={(e) => setCandidate({ ...candidate, lastName: e.target.value })}
                  className="form-control shadow-sm"
                />
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  required
                  value={candidate.email}
                  onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
                  className="form-control shadow-sm"
                />
              </Form.Group>
              <Form.Group controlId="phone">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={candidate.phone}
                  onChange={(e) => setCandidate({ ...candidate, phone: e.target.value })}
                  className="form-control shadow-sm"
                />
              </Form.Group>
              <Form.Group controlId="address">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={candidate.address}
                  onChange={(e) => setCandidate({ ...candidate, address: e.target.value })}
                  className="form-control shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="cv">
                <Form.Label>CV</Form.Label>
                <FileUploader
                  onChange={handleCVUpload}
                  onUpload={handleCVUpload}
                  onUploadError={handleCVUploadError}
                />
                {uploadError && (
                  <Alert variant="danger" className="mt-2 py-2">
                    {uploadError}
                  </Alert>
                )}
              </Form.Group>
              <Row className="mt-4">
                <Button
                  onClick={() => handleAddSection('educations')}
                  className="btn btn-primary btn-sm mr-2"
                >
                  Añadir Educación
                </Button>
              </Row>
              {candidate.educations.map((education, index) => (
                <div key={index} className="mb-3">
                  <Row className="mt-4">
                    <Col md={6}>
                      <FormControl
                        placeholder="Institución"
                        name="institution"
                        value={education.institution}
                        onChange={(e) => handleInputChange(e, index, 'educations')}
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <FormControl
                        placeholder="Título"
                        name="title"
                        value={education.title}
                        onChange={(e) => handleInputChange(e, index, 'educations')}
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <DatePicker
                        selected={education.startDate}
                        onChange={(date: Date | null) => handleDateChange(date, index, 'educations', 'startDate')}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Fecha de Inicio"
                        className="form-control shadow-sm"
                      />
                    </Col>
                    <Col md={6}>
                      <DatePicker
                        selected={education.endDate}
                        onChange={(date: Date | null) => handleDateChange(date, index, 'educations', 'endDate')}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Fecha de Fin"
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveSection(index, 'educations')}
                    className="mt-2"
                  >
                    <Trash /> Eliminar
                  </Button>
                </div>
              ))}
              <Row className="mt-4">
                <Button
                  onClick={() => handleAddSection('workExperiences')}
                  className="btn btn-primary btn-sm mr-2"
                >
                  Añadir Experiencia Laboral
                </Button>
              </Row>
              {candidate.workExperiences.map((experience, index) => (
                <div key={index} className="mb-3">
                  <Row className="mt-4">
                    <Col md={6}>
                      <FormControl
                        placeholder="Empresa"
                        name="company"
                        value={experience.company}
                        onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <FormControl
                        placeholder="Puesto"
                        name="position"
                        value={experience.position}
                        onChange={(e) => handleInputChange(e, index, 'workExperiences')}
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <DatePicker
                        selected={experience.startDate}
                        onChange={(date: Date | null) => handleDateChange(date, index, 'workExperiences', 'startDate')}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Fecha de Inicio"
                        className="form-control shadow-sm"
                      />
                    </Col>
                    <Col md={6}>
                      <DatePicker
                        selected={experience.endDate}
                        onChange={(date: Date | null) => handleDateChange(date, index, 'workExperiences', 'endDate')}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Fecha de Fin"
                        className="form-control shadow-sm"
                      />
                    </Col>
                  </Row>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveSection(index, 'workExperiences')}
                    className="mt-2"
                  >
                    <Trash /> Eliminar
                  </Button>
                </div>
              ))}
            </Col>
          </Row>
          <Button type="submit" className="btn btn-primary btn-block shadow-sm mt-5">
            Enviar
          </Button>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
        </Form>
      </Card>
    </Container>
  );
};

export default AddCandidateForm;