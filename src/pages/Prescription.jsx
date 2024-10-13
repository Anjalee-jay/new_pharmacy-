import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config'; // Ensure correct path to firebase config
import './Prescription.css';

function PrescriptionsList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);

  // Fetch prescriptions and appointments from Firestore
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const prescriptionsCollection = collection(db, 'prescriptions');
        const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
        const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error("Error fetching prescriptions: ", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(appointmentsData); // Store appointments in state
      } catch (error) {
        console.error("Error fetching appointments: ", error);
      }
    };

    fetchPrescriptions();
    fetchAppointments();
  }, []);

  // Define handleSearch function to filter prescriptions based on search query and appointments
  const handleSearch = () => {
    const searchText = searchQuery.toLowerCase();
    
    // Filter prescriptions by search text (patient name, email, appointmentId)
    const filtered = prescriptions.filter(prescription => {
      return (
        (prescription.patientName?.toLowerCase() || '').includes(searchText) || 
        (prescription.email?.toLowerCase() || '').includes(searchText) ||
        (prescription.appointmentId?.toLowerCase() || '').includes(searchText)
      );
    });

    // Further filter prescriptions by matching them with appointmentNumber from Appointments
    const filteredByAppointment = filtered.filter(prescription =>
      appointments.some(appointment => appointment.appointmentNumber === prescription.appointmentId)
    );

    setFilteredPrescriptions(filteredByAppointment);
  };

  // Re-run handleSearch whenever searchQuery, prescriptions, or appointments change
  useEffect(() => {
    handleSearch();
  }, [searchQuery, prescriptions, appointments]);

  const handleViewPrescription = (prescription) => {
    console.log('Viewing prescription:', prescription);
    alert(`Prescription for ${prescription.patientName}: ${prescription.medicineName}`);
  };

  return (
    <div className="prescriptions-list">
      <h2>Prescriptions List</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or appointment number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Updates searchQuery on user input
        />
        <button onClick={handleSearch}>Search</button> {/* Calls handleSearch on button click */}
      </div>
      <table>
        <thead>
          <tr>
            <th>Appointment No</th>
            <th>Patient Name</th>
            <th>Email</th>
            <th>Prescription</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrescriptions.map((prescription, index) => (
            <tr key={index}>
              <td>{prescription.appointmentId}</td> {/* Matches appointmentNumber */}
              <td>{prescription.patientName}</td>
              <td>{prescription.email}</td>
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
