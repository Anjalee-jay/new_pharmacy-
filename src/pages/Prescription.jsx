import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config'; // Ensure correct path to firebase config
import CryptoJS from 'crypto-js'; // Import CryptoJS for decryption
import './Prescription.css';

// Use the provided decryption key
const DECRYPTION_KEY = '4x^6!m$7gQ&9n8F*r1zW@b5k0jL#3xD';

function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);

  // Decryption function using AES
  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, DECRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data: ', error);
      return null; // Return null on error
    }
  };

  // Fetch prescriptions from Firestore
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const prescriptionsCollection = collection(db, 'prescriptions');
        const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
        const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appointmentNo: decryptData(doc.data().appointmentNo), // Decrypt appointmentNo
          phoneNumber: decryptData(doc.data().phoneNumber), // Decrypt phoneNumber
          patient: decryptData(doc.data().patient), // Decrypt patient name
        }));
        setPrescriptions(prescriptionsData);
        setFilteredPrescriptions(prescriptionsData); // Set initial filtered prescriptions
      } catch (error) {
        console.error("Error fetching prescriptions: ", error);
      }
    };

    fetchPrescriptions();
  }, []);

  // Filter prescriptions based on search query
  useEffect(() => {
    handleSearch();
  }, [searchQuery, prescriptions]);

  const handleSearch = () => {
    const searchText = searchQuery.toLowerCase();
    const filtered = prescriptions.filter(prescription => {
      return (
        (prescription.patient?.toLowerCase() || '').includes(searchText) ||
        (prescription.phoneNumber?.toLowerCase() || '').includes(searchText) ||
        (prescription.appointmentNo?.toLowerCase() || '').includes(searchText)
      );
    });
    setFilteredPrescriptions(filtered);
  };

  const handleViewPrescription = (prescription) => {
    console.log('Viewing prescription:', prescription);
    alert(`Prescription for ${prescription.patient}: ${prescription.medicineName}`);
  };

  return (
    <div className="prescriptions-list">
      <h2>Prescriptions List</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by patient name, phone number, or appointment number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state on input
        />
        <button onClick={handleSearch}>Search</button> {/* Search button for manual search */}
      </div>
      <table>
        <thead>
          <tr>
            <th>Appointment No</th>
            <th>Phone Number</th>
            <th>Patient</th>
            <th>Prescription</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrescriptions.map((prescription, index) => (
            <tr key={index}>
              <td>{prescription.appointmentNo}</td> {/* Displaying decrypted appointmentNo */}
              <td>{prescription.phoneNumber}</td> {/* Displaying decrypted phoneNumber */}
              <td>{prescription.patient}</td> {/* Display decrypted patient name */}
              <td>
                <button onClick={() => handleViewPrescription(prescription)}>
                  View Prescription
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionsList;
