import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { Droppable } from 'react-beautiful-dnd';
import CandidateCard from './CandidateCard';

const toTestId = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const StageColumn = ({ stage, index, onCardClick }) => (
    <Col md={3}>
        <Droppable droppableId={`${index}`}>
            {(provided) => (
                <Card
                    className="mb-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    data-testid={`phase-column-${toTestId(stage.title)}`}
                >
                    <Card.Header className="text-center" data-testid={`phase-title-${toTestId(stage.title)}`}>{stage.title}</Card.Header>
                    <Card.Body data-testid={`phase-candidate-list-${toTestId(stage.title)}`}>
                        {stage.candidates.map((candidate, idx) => (
                            <CandidateCard key={candidate.id} candidate={candidate} index={idx} onClick={onCardClick} />
                        ))}
                        {provided.placeholder}
                    </Card.Body>
                </Card>
            )}
        </Droppable>
    </Col>
);

export default StageColumn;
