import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { Droppable } from 'react-beautiful-dnd';
import CandidateCard from './CandidateCard';

const toPhaseSlug = (title) =>
    title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const StageColumn = ({ stage, index, onCardClick }) => (
    <Col md={3}>
        <Droppable droppableId={`${index}`}>
            {(provided) => (
                <Card
                    className="mb-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    data-testid={`phase-column-${toPhaseSlug(stage.title)}`}
                >
                    <Card.Header className="text-center">{stage.title}</Card.Header>
                    <Card.Body>
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
