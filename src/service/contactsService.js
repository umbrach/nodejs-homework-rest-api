const Contact = require("../db/contactModel");
const { WrongParametersError } = require("../helpers/errors");

const getContacts = async (owner) => {
  const data = await Contact.find({ owner });
  return data;
};

const getContactById = async (contactId, owner) => {
  const data = await Contact.findOne({ _id: contactId, owner });
  if (!data) {
    throw new WrongParametersError(`Contact with id '${contactId}' not found`);
  }
  return data;
};

const addContact = async (body, owner) => {
  const { name, email, phone } = body;
  const data = await Contact.create({ name, email, phone, owner });
  return data;
};

const removeContact = async (contactId, owner) => {
  const data = await Contact.findOneAndDelete({ _id: contactId, owner });
  if (!data) {
    throw new WrongParametersError(`Contact with id '${contactId}' not found`);
  }
  return data;
};

const updateContact = async (contactId, body, owner) => {
  const data = await Contact.findOneAndUpdate({ _id: contactId, owner }, body, {
    new: true,
  });
  if (!data) {
    throw new WrongParametersError(`Contact with ${contactId} don't found`);
  }
  return data;
};

const patchContact = async (contactId, body, owner) => {
  const data = await Contact.findOneAndUpdate({ _id: contactId, owner }, body, {
    new: true,
  });
  if (!data) {
    throw new WrongParametersError(`Contact with ${contactId} don't found`);
  }
  return data;
};

module.exports = {
  getContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  patchContact,
};
