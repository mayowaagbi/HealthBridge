import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Trash2 } from "lucide-react";

type Contact = {
  id: number;
  name: string;
  phone: string;
};

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "John Doe", phone: "(123) 456-7890" },
  ]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const addContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (newName && newPhone) {
      setContacts([
        ...contacts,
        { id: Date.now(), name: newName, phone: newPhone },
      ]);
      setNewName("");
      setNewPhone("");
    }
  };

  const removeContact = (id: number) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {contacts.map((contact) => (
          <li key={contact.id} className="flex justify-between items-center">
            <span>
              {contact.name}: {contact.phone}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeContact(contact.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <form onSubmit={addContact} className="space-y-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Contact Name"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone Number"
          />
        </div>
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </form>
    </div>
  );
}
