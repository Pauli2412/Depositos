async function mapUser(user) {
  return {
    plataforma: user.Plataforma,
    usuario: user["Nombre Usuario"] || user.Nombre,
  };
}

module.exports = { mapUser };
