import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case "POST":
      return req.body.type === "register"
        ? await registerUser(req, res)
        : await loginUser(req, res);

    default:
      return res.status(405).json({ message: "Methode nicht erlaubt" });
  }
}

async function registerUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, password } = req.body;

    // Validierung
    if (!username || username.length < 2) {
      return res
        .status(400)
        .json({ message: "Benutzername muss mindestens 2 Zeichen lang sein" });
    }
    if (!password || password.length < 4) {
      return res
        .status(400)
        .json({ message: "Passwort muss mindestens 4 Zeichen lang sein" });
    }

    // Prüfen, ob Benutzername bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Benutzername bereits vergeben" });
    }

    // Neuen Benutzer erstellen
    const newUser = new User({
      username,
      password,
    });

    // Benutzer speichern
    await newUser.save();

    return res.status(201).json({
      message: "Benutzer erfolgreich registriert",
      user: {
        id: newUser._id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Registrierungsfehler:", error);
    return res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
}

async function loginUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, password } = req.body;

    // Benutzer finden
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    // Passwort überprüfen (Klartext-Vergleich)
    if (user.password !== password) {
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });
    }

    // Bei erfolgreicher Anmeldung
    return res.status(200).json({
      message: "Anmeldung erfolgreich",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Anmeldefehler:", error);
    return res.status(500).json({ message: "Fehler bei der Anmeldung" });
  }
}
