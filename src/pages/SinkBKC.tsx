import React, { useEffect } from 'react';

interface SyncProps {
    incomingData?: any; // Podaci koji stižu iz tvog programa
}

const SyncComponent: React.FC<SyncProps> = ({ incomingData }) => {

    useEffect(() => {
        // Proveravamo da li su pravi podaci stigli (da ne šaljemo prazan req)
        if (incomingData && Object.keys(incomingData).length > 0) {
            
            const forwardToBackend = async () => {
                try {
                    await fetch('https://samirtal-002-site7.qtempurl.com/api/sync/import', {
                        method: 'POST', // Ograničeno na POST
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-KEY': 'Sinhronizacionikljuc' // Dodajemo zaštitu
                        },
                        body: JSON.stringify(incomingData) // Šaljemo stvarne podatke u body
                    });
                    console.log("Podaci uspešno prosleđeni na backend.");
                } catch (err) {
                    console.error("Greška pri prosleđivanju:", err);
                }
            };

            forwardToBackend();
        }
    }, [incomingData]); // Izvršava se čim se 'incomingData' promeni

    return null; // Frontend ostaje prazan, radi samo kao servis
};

export default SyncComponent;