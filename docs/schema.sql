-- my-todoList schema (PostgreSQL 17)
-- Source: docs/7-erd.md (v0.1)

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         varchar(255) NOT NULL UNIQUE,
    password      varchar(255) NOT NULL,
    name          varchar(50)  NOT NULL,
    created_at    timestamp    NOT NULL DEFAULT now(),
    updated_at    timestamp    NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          varchar(50) NOT NULL,
    is_default    boolean NOT NULL DEFAULT false,
    UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

CREATE TABLE todos (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id   uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title         varchar(200) NOT NULL,
    description   text,
    start_date    date NOT NULL,
    end_date      date NOT NULL,
    is_completed  boolean NOT NULL DEFAULT false,
    completed_at  timestamp,
    created_at    timestamp NOT NULL DEFAULT now(),
    updated_at    timestamp NOT NULL DEFAULT now(),
    CHECK (start_date <= end_date)
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
