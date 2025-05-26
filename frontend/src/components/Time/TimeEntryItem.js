import React from 'react';
import Button from '../common/Button';

/**

 * @author EK
 * Code von anderen Teammitgliedern oder Quellen wird durch einzelne Kommentare deklariert
 * @version 1.0
 */

const TimeEntryItem = ({ entry, onEdit, onDelete }) => {
    const formatTime = (time) => {
        return time ? time.substring(0, 5) : '';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const calculateTotalHours = () => {
        // Diese Berechnung sollte idealerweise vom Backend kommen
        return entry.actualHours || '00:00';
    };

    return (
        <div className="time-entry-item">
            <div className="entry-header">
                <div className="entry-date">{formatDate(entry.date)}</div>
                <div className="entry-total">{calculateTotalHours()}</div>
            </div>

            <div className="entry-details">
                <div className="entry-times">
                    {entry.startTimes?.map((start, index) => (
                        <div key={index} className="time-slot">
                            {formatTime(start)} - {formatTime(entry.endTimes?.[index])}
                        </div>
                    ))}
                </div>

                {entry.breaks && entry.breaks.length > 0 && (
                    <div className="entry-breaks">
                        <strong>Pausen:</strong>
                        {entry.breaks.map((breakTime, index) => (
                            <span key={index} className="break-time">
                {formatTime(breakTime.start)} - {formatTime(breakTime.end)}
              </span>
                        ))}
                    </div>
                )}

                {entry.project && (
                    <div className="entry-project">
                        <strong>Projekt:</strong> {entry.project.name}
                    </div>
                )}
            </div>

            <div className="entry-actions">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => onEdit(entry)}
                >
                    Bearbeiten
                </Button>
                <Button
                    variant="danger"
                    size="small"
                    onClick={() => onDelete(entry.id)}
                >
                    Löschen
                </Button>
            </div>
        </div>
    );
};

export default TimeEntryItem;