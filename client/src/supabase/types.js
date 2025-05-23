// JSON type is not needed in JS since JS handles dynamic types natively

// Database schema mock structure
const Database = {
  public: {
    Tables: {
      // no tables defined
    },
    Views: {},
    Functions: {},
    Enums: {},
    CompositeTypes: {},
  }
}

// Default schema reference
const DefaultSchema = Database["public"]

// Utility functions to simulate the behavior of the TS generics

function Tables(defaultSchemaTableNameOrOptions, tableName) {
  if (typeof defaultSchemaTableNameOrOptions === "object") {
    const schema = defaultSchemaTableNameOrOptions.schema
    const table = Database[schema]?.Tables?.[tableName] || Database[schema]?.Views?.[tableName]
    return table?.Row ?? null
  } else {
    const table = DefaultSchema.Tables?.[defaultSchemaTableNameOrOptions] ||
                  DefaultSchema.Views?.[defaultSchemaTableNameOrOptions]
    return table?.Row ?? null
  }
}

function TablesInsert(defaultSchemaTableNameOrOptions, tableName) {
  if (typeof defaultSchemaTableNameOrOptions === "object") {
    const schema = defaultSchemaTableNameOrOptions.schema
    const table = Database[schema]?.Tables?.[tableName]
    return table?.Insert ?? null
  } else {
    const table = DefaultSchema.Tables?.[defaultSchemaTableNameOrOptions]
    return table?.Insert ?? null
  }
}

function TablesUpdate(defaultSchemaTableNameOrOptions, tableName) {
  if (typeof defaultSchemaTableNameOrOptions === "object") {
    const schema = defaultSchemaTableNameOrOptions.schema
    const table = Database[schema]?.Tables?.[tableName]
    return table?.Update ?? null
  } else {
    const table = DefaultSchema.Tables?.[defaultSchemaTableNameOrOptions]
    return table?.Update ?? null
  }
}

function Enums(defaultSchemaEnumNameOrOptions, enumName) {
  if (typeof defaultSchemaEnumNameOrOptions === "object") {
    const schema = defaultSchemaEnumNameOrOptions.schema
    return Database[schema]?.Enums?.[enumName] ?? null
  } else {
    return DefaultSchema.Enums?.[defaultSchemaEnumNameOrOptions] ?? null
  }
}

function CompositeTypes(publicCompositeTypeNameOrOptions, compositeTypeName) {
  if (typeof publicCompositeTypeNameOrOptions === "object") {
    const schema = publicCompositeTypeNameOrOptions.schema
    return Database[schema]?.CompositeTypes?.[compositeTypeName] ?? null
  } else {
    return DefaultSchema.CompositeTypes?.[publicCompositeTypeNameOrOptions] ?? null
  }
}

// Constant definition
const Constants = {
  public: {
    Enums: {}
  }
}
