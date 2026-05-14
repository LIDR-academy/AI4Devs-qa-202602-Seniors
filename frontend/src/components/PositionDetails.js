import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Button } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import StageColumn from './StageColumn';
import CandidateDetails from './CandidateDetails';
import { useNavigate } from 'react-router-dom';

const PositionsDetails = () => {
    const { id } = useParams();
    const [stages, setStages] = useState([]);
    const [positionName, setPositionName] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPositionBoard = async () => {
            try {
                const [flowResponse, candidatesResponse] = await Promise.all([
                    fetch(`http://localhost:3010/positions/${id}/interviewFlow`),
                    fetch(`http://localhost:3010/positions/${id}/candidates`)
                ]);

                const data = await flowResponse.json();
                const candidates = await candidatesResponse.json();
                const interviewSteps = data.interviewFlow.interviewFlow.interviewSteps.map(step => ({
                    title: step.name,
                    id: step.id,
                    candidates: candidates
                        .filter(candidate => candidate.currentInterviewStep === step.name)
                        .map(candidate => ({
                            id: candidate.candidateId.toString(),
                            name: candidate.fullName,
                            rating: candidate.averageScore,
                            applicationId: candidate.applicationId
                        }))
                }));

                setStages(interviewSteps);
                setPositionName(data.interviewFlow.positionName);
            } catch (error) {
                console.error('Error fetching position board:', error);
            }
        };

        fetchPositionBoard();
    }, [id]);

    const updateCandidateStep = async (candidateId, applicationId, newStep) => {
        try {
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicationId: Number(applicationId),
                    currentInterviewStep: Number(newStep)
                })
            };

            let response = await fetch(`http://localhost:3010/candidate/${candidateId}`, requestOptions);

            if (!response.ok) {
                response = await fetch(`http://localhost:3010/candidates/${candidateId}`, requestOptions);
            }

            if (!response.ok) {
                throw new Error('Error updating candidate step');
            }
        } catch (error) {
            console.error('Error updating candidate step:', error);
        }
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const sourceStage = stages[source.droppableId];
        const destStage = stages[destination.droppableId];

        const [movedCandidate] = sourceStage.candidates.splice(source.index, 1);
        destStage.candidates.splice(destination.index, 0, movedCandidate);

        setStages([...stages]);

        const destStageId = stages[destination.droppableId].id;

        updateCandidateStep(movedCandidate.id, movedCandidate.applicationId, destStageId);
    };

    const handleCardClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const closeSlide = () => {
        setSelectedCandidate(null);
    };

    return (
        <Container className="mt-5" data-testid="position-page">
            <Button variant="link" onClick={() => navigate('/positions')} className="mb-3">
                Volver a Posiciones
            </Button>
            <h2 className="text-center mb-4" data-testid="position-title">{positionName}</h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Row data-testid="position-board">
                    {stages.map((stage, index) => (
                        <StageColumn key={index} stage={stage} index={index} onCardClick={handleCardClick} />
                    ))}
                </Row>
            </DragDropContext>
            <CandidateDetails candidate={selectedCandidate} onClose={closeSlide} />
        </Container>
    );
};

export default PositionsDetails;
