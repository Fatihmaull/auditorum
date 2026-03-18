/**
 * Anchor IDL type definition for auditorum_protocol.
 *
 * This is a TypeScript representation of what `anchor build` generates.
 * It allows the frontend to construct transactions without running anchor build.
 */

export type AuditorumProtocol = {
  version: "0.1.0";
  name: "auditorum_protocol";
  instructions: [
    {
      name: "createAuditRecord";
      accounts: [
        { name: "auditRecord"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "hash"; type: { array: ["u8", 32] } },
        { name: "industry"; type: "u8" },
        { name: "role"; type: "u8" }
      ];
    }
  ];
  accounts: [
    {
      name: "AuditRecord";
      type: {
        kind: "struct";
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "hash"; type: { array: ["u8", 32] } },
          { name: "industry"; type: "u8" },
          { name: "role"; type: "u8" },
          { name: "createdAt"; type: "i64" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
  errors: [
    { code: 6000; name: "InvalidIndustry"; msg: "Invalid industry value." },
    { code: 6001; name: "InvalidRole"; msg: "Invalid role value." }
  ];
};

export const IDL: AuditorumProtocol = {
  version: "0.1.0",
  name: "auditorum_protocol",
  instructions: [
    {
      name: "createAuditRecord",
      accounts: [
        { name: "auditRecord", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "hash", type: { array: ["u8", 32] } },
        { name: "industry", type: "u8" },
        { name: "role", type: "u8" },
      ],
    },
  ],
  accounts: [
    {
      name: "AuditRecord",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "hash", type: { array: ["u8", 32] } },
          { name: "industry", type: "u8" },
          { name: "role", type: "u8" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "InvalidIndustry", msg: "Invalid industry value." },
    { code: 6001, name: "InvalidRole", msg: "Invalid role value." },
  ],
};
