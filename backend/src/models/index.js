const User = require("./User");
const Profile = require("./ProfileModel");
const Appointment = require("./Appointment");
const StudentDetails = require("./StudentDetails");
const ProviderDetails = require("./ProviderDetails");
const HealthRecord = require("./HealthRecord");
// const JournalEntry = require("./JournalEntry");
// const MoodEntry = require("./MoodEntry");
const ProviderQualification = require("./ProviderQualification");
const AvailabilitySchedule = require("./AvailabilitySchedule");
const AppointmentHistory = require("./AppointmentHistory");
const AppointmentDocument = require("./AppointmentDocument");
const Prescription = require("./Prescription");
const EmergencyContact = require("./EmergencyContact");
const Notification = require("./Notification");
const MedicalDocument = require("./MedicalDocument");
const Session = require("./Session");
module.exports = {
  User,
  Profile,
  Appointment,
  EmergencyContact,
  Notification,
  StudentDetails,
  ProviderDetails,
  HealthRecord,
  // JournalEntry,
  // MoodEntry,
  ProviderQualification,
  AvailabilitySchedule,
  AppointmentHistory,
  AppointmentDocument,
  Prescription,
  MedicalDocument,
  Session,
};
