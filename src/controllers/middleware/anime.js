const VALID_REQUEST_FIELDS = {
  'designated_subgroup': 'string',
  'title': 'string',
  'ann_id': 'string',
  'image_url': 'string',
  'is_watching': 'boolean',
  'is_complete': 'boolean',
  'screen_resolution': 'string',
  'include_gte_screen_resolution': 'boolean',
};

exports.validation = (req, res, next) => {
  const requestFields = Object.keys(req.body);

  if (!req.params.id || requestFields.length === 0) {
    return res.status(400).json({ message: 'Anime ID is required.' });
  }

  const isInvalid = requestFields.some(field => {
    return typeof VALID_REQUEST_FIELDS[field] === 'undefined' ||
      typeof req.body[field] !== VALID_REQUEST_FIELDS[field];
  });

  if (isInvalid) {
    return res.status(400)
      .json({ message: 'Your request contains fields that are not supported by this endpoint.' });
  }

  next();
};
