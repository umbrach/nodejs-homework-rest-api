const {
  getContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  patchContact,
} = require("../service/contactsService");

const get = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const contacts = await getContacts(ownerId);
  res.json(contacts);
};

const getById = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const { contactId } = req.params;
  const contact = await getContactById(contactId, ownerId);
  res.json(contact);
};

const add = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const newContact = await addContact(req.body, ownerId);
  res.status(201).json(newContact);
};

const remove = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const { contactId } = req.params;
  await removeContact(contactId, ownerId);
  res.json({ message: `Contact with ${contactId} deleted` });
};

const update = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const { contactId } = req.params;
  const updateData = await updateContact(contactId, req.body, ownerId);
  res.status(200).json(updateData);
};

const patch = async (req, res, next) => {
  const { _id: ownerId } = req.user;
  const { contactId } = req.params;
  const newContact = await patchContact(contactId, req.body, ownerId);
  // const newContact = await getContactById(contactId);

  res.status(200).json(newContact);
};

module.exports = {
  get,
  getById,
  add,
  remove,
  update,
  patch,
};
