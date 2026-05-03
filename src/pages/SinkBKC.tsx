import React, { useState, type ChangeEvent } from 'react';
import type { BKCImportItem, SyncPayload } from '../../src/types/index'; // Putanja do tipova
 // Putanja do tipova

const SyncComponent: React.FC = () => {
    const [jsonData, setJsonData] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setJsonData(e.target.value);
    };

const handleSync = async () => {
    if (!jsonData.trim()) return;

    try {
        // 1. Parsiraj ono što si zalepio u textarea
        const rawData = JSON.parse(jsonData);

        // 2. Mapiraj na format koji Swagger traži (bitno je da su velika/mala slova ista)
        const payload = rawData.map((item: any) => ({
            name: item.ime,
            price: Number(item.cena),
            unit: item.jedinica,
            categoryName: item.kategorijaIme,
            articleIdBKC: Number(item.idArtiklaBKC),
            categoryIdBKC: Number(item.idKategorijeBKC)
        }));

        console.log("Šaljem na backend:", payload);

        // 3. Slanje (obavezno proveri port, npr. 7123 ili 5000)
        const response = await fetch('https://localhost:7007/api/sync/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("Uspešno sinhronizovano!");
        } else {
            const errorMsg = await response.text();
            alert("Server vratio grešku: " + errorMsg);
        }
    } catch (err) {
        alert("Greška: Proveri da li je JSON ispravan. " + err);
    }
};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
            <h2>Import Artikala iz BKC-a</h2>
            
            <textarea
                rows={12}
                placeholder='Zalepi JSON ovde... (Primer: [{"ime": "Hleb", "cena": 50, ...}])'
                value={jsonData}
                onChange={handleTextareaChange}
                style={{ 
                    padding: '10px', 
                    fontFamily: 'monospace', 
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                }}
            />

            <button 
                onClick={handleSync}
                disabled={loading || !jsonData}
                style={{
                    padding: '10px 20px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Sinhronizacija u toku...' : 'Pokreni Import'}
            </button>
        </div>
    );
};

export default SyncComponent;