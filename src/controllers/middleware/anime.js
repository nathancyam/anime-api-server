const VALID_REQUEST_FIELDS = [
  'designated_subgroup',
  'title',
  'ann_id',
  'image_url',
  'is_watching',
  'is_complete'
];

exports.validation = (req, res, next) => {
  const requestFields = Object.keys(req.body);

  if (!req.params.id || requestFields.length === 0) {
    return res.status(400).json({ message: 'Anime ID is required.' });
  }

  if (requestFields.some(field => VALID_REQUEST_FIELDS.indexOf(field) == -1)) {
    return res.status(400)
      .json({ message: 'Your request contains fields that are not supported by this endpoint.' });
  }

  next();
};
