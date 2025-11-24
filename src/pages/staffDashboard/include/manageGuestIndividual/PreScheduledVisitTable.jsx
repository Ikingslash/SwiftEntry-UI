import { useState, useEffect } from "react";
import api from "../../../../context/api";
import { toast } from "react-toastify";

function PreScheduledVisitTable({ onVisitUpdate }) {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modal and action states
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    actual_check_in_time: "",
    notes: "",
  });

    useEffect(() => {
      fetchVisits();
    }, [page]);

   const fetchVisits = async () => {
     setLoading(true);
     try {
       const response = await api.get("staff/guests/individual-rescheduled-visit", {
         params: { per_page: perPage, page },
       });

       setVisits(response.data.visits);
       setPagination(response.data.pagination);
     } catch (error) {
       console.error("Error fetching visits:", error);
       toast.error("Failed to load visits");
     } finally {
       setLoading(false);
     }
   };

 const openCheckInModal = (visit) => {
   setSelectedVisit(visit);
   // Set default check-in time to current time
   setCheckInForm({
     actual_check_in_time: new Date().toISOString().slice(0, 16),
     notes: "",
   });
   setShowCheckInModal(true);
 };

 const openCheckOutModal = (visit) => {
   setSelectedVisit(visit);
   setShowCheckOutModal(true);
 };

 const handleCheckInFormChange = (e) => {
   const { name, value } = e.target;
   setCheckInForm((prev) => ({
     ...prev,
     [name]: value,
   }));
 };

 const handleCheckIn = async () => {
   try {
     await api.post(`/staff/visit/${selectedVisit.id}/check-in`, checkInForm);
     toast.success("Visitor checked in successfully!");
     setShowCheckInModal(false);
     setCheckInForm({ actual_check_in_time: "", notes: "" });
     fetchVisits();
     if (onVisitUpdate) {
       onVisitUpdate();
     }
   } catch (error) {
       console.error("Check-in Error:", error);
          toast.error(error.response?.data?.error || "Check-in failed");
   }
 };

 const handleCheckOut = async () => {
   try {
     await api.post(`/staff/visit/${selectedVisit.id}/check-out`);
     toast.success("Visitor checked out successfully!");
     setShowCheckOutModal(false);
     await fetchVisits();
     if (onVisitUpdate) {
       onVisitUpdate();
     }
   } catch (error) {
     toast.error("Check-out failed");
   }
 };

 const handlePrevious = () => {
   if (pagination.current_page > 1) setPage((prev) => prev - 1);
 };

 const handleNext = () => {
   if (pagination.current_page < pagination.last_page)
     setPage((prev) => prev + 1);
 };

  if (loading) {
    return <p>Loading...</p>;
  }

 return (
   <div>
     <div className="table-responsive my-5">
       {visits.length > 0 ? (
         <>
           <table className="table table-bordered table-hover">
             <thead>
               <tr>
                 <th>Unique ID</th>
                 <th>Guest Name</th>
                 <th>Host Name</th>
                 <th>Visit Date/Time</th>
                 <th>Contact</th>
                 <th>Email</th>
                 <th>Special Requirement</th>
                 <th>Check-in</th>
                 <th>Check-out</th>
               </tr>
             </thead>

             <tbody>
               {visits.map((visit) => (
                 <tr key={visit.id}>
                   <td>{visit.id}</td>
                   <td>{visit.visitor?.name || "N/A"}</td>
                   <td>{visit.host_name}</td>
                   <td>
                     {visit.visit_time
                       ? new Date(visit.visit_time).toLocaleString()
                       : "N/A"}
                   </td>
                   <td>{visit.visitor?.contact_number}</td>
                   <td>{visit.visitor?.email}</td>
                   <td>{visit.visitor?.special_requirements || "None"}</td>

                   {/* CHECK IN COLUMN */}
                   <td>
                     {visit.check_in === null ? (
                       <button
                         className="btn btn-success btn-sm"
                         onClick={() => openCheckInModal(visit)}
                       >
                         Check In
                       </button>
                     ) : (
                       <span className="badge bg-primary">
                         {new Date(visit.check_in).toLocaleString()}
                       </span>
                     )}
                   </td>

                   {/* CHECK OUT COLUMN */}
                   <td>
                     {visit.check_in !== null && visit.check_out === null ? (
                       <button
                         className="btn btn-danger btn-sm"
                         onClick={() => openCheckOutModal(visit)}
                       >
                         Check Out
                       </button>
                     ) : (
                       <span className="text-muted">—</span>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>

           {/* Pagination */}
           <div className="d-flex justify-content-between align-items-center mt-3">
             <button
               className="btn btn-primary"
               onClick={handlePrevious}
               disabled={pagination.current_page === 1}
             >
               Previous
             </button>

             <span>
               Page {pagination.current_page} of {pagination.last_page}
             </span>

             <button
               className="btn btn-primary"
               onClick={handleNext}
               disabled={pagination.current_page === pagination.last_page}
             >
               Next
             </button>
           </div>
         </>
       ) : (
         <h1>No Data Available</h1>
       )}
     </div>

     {/* CHECK-IN MODAL WITH FORM */}
     {showCheckInModal && (
       <div className="modal fade show d-block" tabIndex="-1">
         <div className="modal-dialog modal-dialog-centered">
           <div className="modal-content p-3">
             <h4>Check In Visitor</h4>

             <p>
               Check in details for{" "}
               <strong>{selectedVisit.visitor?.name}</strong>
             </p>

             <form>
               <div className="mb-3">
                 <label htmlFor="actual_check_in_time" className="form-label">
                   Check-in Time
                 </label>
                 <input
                   type="datetime-local"
                   className="form-control"
                   id="actual_check_in_time"
                   name="actual_check_in_time"
                   value={checkInForm.actual_check_in_time}
                   onChange={handleCheckInFormChange}
                   required
                 />
               </div>

               <div className="mb-3">
                 <label htmlFor="notes" className="form-label">
                   Additional Notes
                 </label>
                 <textarea
                   className="form-control"
                   id="notes"
                   name="notes"
                   rows="3"
                   value={checkInForm.notes}
                   onChange={handleCheckInFormChange}
                   placeholder="Any additional notes for this check-in..."
                 ></textarea>
               </div>
             </form>

             <div className="d-flex justify-content-end gap-2">
               <button
                 className="btn btn-secondary"
                 onClick={() => {
                   setShowCheckInModal(false);
                   setCheckInForm({ actual_check_in_time: "", notes: "" });
                 }}
               >
                 Cancel
               </button>
               <button
                 className="btn btn-success"
                 onClick={handleCheckIn}
                 disabled={!checkInForm.actual_check_in_time}
               >
                 Submit Check-In
               </button>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* CHECK-OUT MODAL */}
     {showCheckOutModal && (
       <div className="modal fade show d-block" tabIndex="-1">
         <div className="modal-dialog modal-dialog-centered">
           <div className="modal-content p-3">
             <h4>Confirm Check-Out</h4>

             <p>
               Are you sure you want to check out{" "}
               <strong>{selectedVisit.visitor?.name}</strong>?
             </p>

             <div className="d-flex justify-content-end gap-2">
               <button
                 className="btn btn-secondary"
                 onClick={() => setShowCheckOutModal(false)}
               >
                 Cancel
               </button>
               <button className="btn btn-danger" onClick={handleCheckOut}>
                 Confirm Check-Out
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}

export default PreScheduledVisitTable;
