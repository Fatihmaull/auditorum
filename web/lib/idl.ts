export type AuditorumProtocol = {
  version: "0.2.0";
  name: "auditorum_protocol";
  instructions: [
    {
      name: "initialize";
      accounts: [
        { name: "globalState"; isMut: true; isSigner: false },
        { name: "signer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "createWorkspace";
      accounts: [
        { name: "globalState"; isMut: true; isSigner: false },
        { name: "workspace"; isMut: true; isSigner: false },
        { name: "admin"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "companyName"; type: "string" }];
    },
    {
      name: "assignAuditor";
      accounts: [
        { name: "globalState"; isMut: false; isSigner: false },
        { name: "workspace"; isMut: false; isSigner: false },
        { name: "auditorAssignment"; isMut: true; isSigner: false },
        { name: "admin"; isMut: true; isSigner: true },
        { name: "auditor"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "firmPubkey"; type: "publicKey" },
        { name: "expiry"; type: "i64" }
      ];
    },
    {
      name: "uploadDocument";
      accounts: [
        { name: "globalState"; isMut: false; isSigner: false },
        { name: "workspace"; isMut: false; isSigner: false },
        { name: "auditorAssignment"; isMut: false; isSigner: false },
        { name: "document"; isMut: true; isSigner: false },
        { name: "uploader"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "fileHash"; type: { array: ["u8", 32] } },
        { name: "fileCid"; type: "string" },
        { name: "category"; type: "u8" },
        { name: "visibility"; type: "u8" }
      ];
    },
    {
      name: "acknowledgeDocument";
      accounts: [
        { name: "workspace"; isMut: false; isSigner: false },
        { name: "document"; isMut: true; isSigner: false },
        { name: "admin"; isMut: true; isSigner: true }
      ];
      args: [];
    },
    {
      name: "flagDocument";
      accounts: [
        { name: "globalState"; isMut: false; isSigner: false },
        { name: "document"; isMut: true; isSigner: false },
        { name: "superadmin"; isMut: true; isSigner: true }
      ];
      args: [];
    }
  ];
  accounts: [];
  errors: [];
};

export const IDL: AuditorumProtocol | any = {
  address: "6Xz5kQtfcSUf9tjgHWFqA9rMaNEdwY14AWsLdJQkuau7",
  metadata: {
    address: "6Xz5kQtfcSUf9tjgHWFqA9rMaNEdwY14AWsLdJQkuau7",
  },
  version: "0.2.0",
  name: "auditorum_protocol",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "globalState", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "createWorkspace",
      accounts: [
        { name: "globalState", isMut: true, isSigner: false },
        { name: "workspace", isMut: true, isSigner: false },
        { name: "admin", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "companyName", type: "string" }],
    },
    {
      name: "assignAuditor",
      accounts: [
        { name: "globalState", isMut: false, isSigner: false },
        { name: "workspace", isMut: false, isSigner: false },
        { name: "auditorAssignment", isMut: true, isSigner: false },
        { name: "admin", isMut: true, isSigner: true },
        { name: "auditor", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "firmPubkey", type: "publicKey" },
        { name: "expiry", type: "i64" },
      ],
    },
    {
      name: "uploadDocument",
      accounts: [
        { name: "globalState", isMut: false, isSigner: false },
        { name: "workspace", isMut: false, isSigner: false },
        { name: "auditorAssignment", isMut: false, isSigner: false, isOptional: true },
        { name: "document", isMut: true, isSigner: false },
        { name: "uploader", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "fileHash", type: { array: ["u8", 32] } },
        { name: "fileCid", type: "string" },
        { name: "category", type: "u8" },
        { name: "visibility", type: "u8" },
      ],
    },
    {
      name: "acknowledgeDocument",
      accounts: [
        { name: "workspace", isMut: false, isSigner: false },
        { name: "document", isMut: true, isSigner: false },
        { name: "admin", isMut: true, isSigner: true },
      ],
      args: [],
    },
    {
      name: "flagDocument",
      accounts: [
        { name: "globalState", isMut: false, isSigner: false },
        { name: "document", isMut: true, isSigner: false },
        { name: "superadmin", isMut: true, isSigner: true },
      ],
      args: [],
    },
  ],
  accounts: [],
  errors: [],
};
export default IDL;
