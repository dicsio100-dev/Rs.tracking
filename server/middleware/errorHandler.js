const multer = require('multer');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);

  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux. Taille maximum: 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Trop de fichiers. Maximum: 5 fichiers par requête.'
      });
    }
    return res.status(400).json({ error: `Erreur d'upload: ${err.message}` });
  }

  // Custom file filter error
  if (err.message && err.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({ error: err.message });
  }

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Erreur interne du serveur.'
  });
}

module.exports = { errorHandler };
