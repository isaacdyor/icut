// @generated automatically by Diesel CLI.

diesel::table! {
    assets (id) {
        id -> Nullable<Integer>,
        project_id -> Integer,
        file_path -> Text,
        asset_type -> Text,
        duration_ms -> Nullable<Integer>,
        width -> Nullable<Integer>,
        height -> Nullable<Integer>,
        file_size_bytes -> Integer,
        imported_at -> Timestamp,
    }
}

diesel::table! {
    clips (id) {
        id -> Nullable<Integer>,
        track_id -> Integer,
        asset_id -> Nullable<Integer>,
        start_time_ms -> Integer,
        duration_ms -> Integer,
        asset_start_offset_ms -> Integer,
        asset_end_offset_ms -> Integer,
        volume -> Float,
        is_muted -> Bool,
    }
}

diesel::table! {
    projects (id) {
        id -> Nullable<Integer>,
        name -> Text,
        duration_ms -> Integer,
        frame_rate -> Integer,
        resolution_width -> Integer,
        resolution_height -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    tracks (id) {
        id -> Nullable<Integer>,
        project_id -> Integer,
        track_type -> Text,
        order_index -> Integer,
        is_locked -> Bool,
        is_muted -> Bool,
    }
}

diesel::joinable!(assets -> projects (project_id));
diesel::joinable!(clips -> assets (asset_id));
diesel::joinable!(clips -> tracks (track_id));
diesel::joinable!(tracks -> projects (project_id));

diesel::allow_tables_to_appear_in_same_query!(assets, clips, projects, tracks,);
