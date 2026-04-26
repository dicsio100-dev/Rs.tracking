import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app": {
        "title": "Activity Report",
        "dashboard": "Dashboard",
        "assistants": "Assistants",
        "logout": "Logout"
      },
      "login": {
        "subtitle": "Activity reporting platform",
        "username": "Username",
        "password": "Password",
        "submit": "Login",
        "restricted": "Access restricted to authorized personnel.",
        "forgot_password": "Forgot Password?",
        "reset_title": "Reset Password",
        "reset_desc": "Enter your admin username to receive new credentials.",
        "reset_submit": "Send Email",
        "reset_back": "Back to login"
      },
      "dashboard": {
        "title": "Admin Dashboard",
        "subtitle": "Overview of assistants' activity",
        "export_pdf": "Export PDF Summary",
        "stats": {
          "reports_today": "Reports Today",
          "submitted": "Submitted (Locked)",
          "pending": "Pending / Drafts",
          "hours": "Tracked Hours"
        },
        "filters": {
          "date": "Date",
          "assistant": "Assistant",
          "status": "Global Status",
          "all_assistants": "All Assistants",
          "all_statuses": "All Statuses",
          "reset": "Reset"
        },
        "table": {
          "date": "Date",
          "assistant": "Assistant",
          "status": "Status",
          "tasks": "Tasks",
          "time": "Total Time",
          "state": "State",
          "actions": "Actions",
          "view": "View Details"
        },
        "empty": "No reports found."
      },
      "report": {
        "report_of": "Report for",
        "tasks": "Completed Tasks",
        "add_task": "+ Add a task",
        "total": "Total",
        "task_desc": "Task Description",
        "time": "Time (h)",
        "status": "Status",
        "status_progress": "In Progress",
        "status_completed": "Completed",
        "status_blocked": "Blocked",
        "remarks": "Remarks / Difficulties",
        "attachments": "Attachments",
        "save_draft": "Save (Draft)",
        "submit": "SUBMIT REPORT"
      },
      "assistants": {
        "title": "Assistants Management",
        "create_btn": "+ Create Assistant",
        "table_name": "Full Name",
        "table_user": "Username",
        "table_role": "Role",
        "table_created": "Created At",
        "modal_title": "Create a new assistant",
        "modal_name": "Full Name",
        "modal_user": "Username",
        "modal_pass": "Password",
        "modal_submit": "Create"
      }
    }
  },
  fr: {
    translation: {
      "app": {
        "title": "Rapport d'Activité",
        "dashboard": "Tableau de Bord",
        "assistants": "Assistants",
        "logout": "Déconnexion"
      },
      "login": {
        "subtitle": "Plateforme de rapport d'activité",
        "username": "Identifiant",
        "password": "Mot de passe",
        "submit": "Se connecter",
        "restricted": "Accès réservé au personnel autorisé.",
        "forgot_password": "Mot de passe oublié ?",
        "reset_title": "Réinitialiser le mot de passe",
        "reset_desc": "Entrez votre identifiant administrateur pour recevoir de nouveaux identifiants.",
        "reset_submit": "Envoyer un email",
        "reset_back": "Retour à la connexion"
      },
      "dashboard": {
        "title": "Tableau de bord Administrateur",
        "subtitle": "Vue d'ensemble de l'activité des assistants",
        "export_pdf": "Exporter la synthèse PDF",
        "stats": {
          "reports_today": "Rapports aujourd'hui",
          "submitted": "Soumis (Verrouillés)",
          "pending": "En attente / Brouillons",
          "hours": "Heures pointées"
        },
        "filters": {
          "date": "Date",
          "assistant": "Assistant",
          "status": "Statut Global",
          "all_assistants": "Tous les assistants",
          "all_statuses": "Tous les statuts",
          "reset": "Réinitialiser"
        },
        "table": {
          "date": "Date",
          "assistant": "Assistant",
          "status": "Statut",
          "tasks": "Tâches",
          "time": "Temps total",
          "state": "État",
          "actions": "Actions",
          "view": "Voir détail"
        },
        "empty": "Aucun rapport trouvé."
      },
      "report": {
        "report_of": "Rapport du",
        "tasks": "Tâches Réalisées",
        "add_task": "+ Ajouter une tâche",
        "total": "Total",
        "task_desc": "Description de la tâche",
        "time": "Temps (h)",
        "status": "Statut",
        "status_progress": "En cours",
        "status_completed": "Terminé",
        "status_blocked": "Bloqué",
        "remarks": "Remarques / Difficulties",
        "attachments": "Pièces jointes",
        "save_draft": "Sauvegarder (Brouillon)",
        "submit": "SOUMETTRE LE RAPPORT"
      },
      "assistants": {
        "title": "Gestion des Assistants",
        "create_btn": "+ Créer un Assistant",
        "table_name": "Nom complet",
        "table_user": "Identifiant",
        "table_role": "Rôle",
        "table_created": "Date de création",
        "modal_title": "Créer un nouvel assistant",
        "modal_name": "Nom complet",
        "modal_user": "Identifiant",
        "modal_pass": "Mot de passe",
        "modal_submit": "Créer"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
