import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { Droppable } from 'react-beautiful-dnd';
import CandidateCard from './CandidateCard';

const StageColumn = ({ stage, index, onCardClick, testId }) => (
    <Col md={3}>
        <Droppable droppableId={`${index}`}>
            {(provided) => (
                <Card className="mb-4" ref={provided.innerRef} {...provided.droppableProps} data-testid={testId}>
                    <Card.Header className="text-center" data-testid={`${testId}-header`}>{stage.title}</Card.Header>
                    <Card.Body>
                        {stage.candidates.map((candidate, idx) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                index={idx}
                                onClick={onCardClick}
                                testId={`candidate-${candidate.id}`}
                            />
                        ))}
                        {provided.placeholder}
                    </Card.Body>
                </Card>
            )}
        </Droppable>
    </Col>
);

export default StageColumn;
