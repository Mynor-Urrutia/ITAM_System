CREATE TABLE "django_migrations" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app" varchar(255) NOT NULL, "name" varchar(255) NOT NULL, "applied" datetime NOT NULL)
CREATE TABLE "auth_group_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED, "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED)
CREATE TABLE "auth_user_groups" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED)
CREATE TABLE "auth_user_user_permissions" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED)
CREATE TABLE "django_admin_log" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "object_id" text NULL, "object_repr" varchar(200) NOT NULL, "action_flag" smallint unsigned NOT NULL CHECK ("action_flag" >= 0), "change_message" text NOT NULL, "content_type_id" integer NULL REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED, "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, "action_time" datetime NOT NULL)
CREATE TABLE "django_content_type" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "app_label" varchar(100) NOT NULL, "model" varchar(100) NOT NULL)
CREATE TABLE "auth_permission" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "content_type_id" integer NOT NULL REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED, "codename" varchar(100) NOT NULL, "name" varchar(255) NOT NULL)
CREATE TABLE "auth_group" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "name" varchar(150) NOT NULL UNIQUE)
CREATE TABLE "auth_user" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "password" varchar(128) NOT NULL, "last_login" datetime NULL, "is_superuser" bool NOT NULL, "username" varchar(150) NOT NULL UNIQUE, "last_name" varchar(150) NOT NULL, "email" varchar(254) NOT NULL, "is_staff" bool NOT NULL, "is_active" bool NOT NULL, "date_joined" datetime NOT NULL, "first_name" varchar(150) NOT NULL)
CREATE TABLE "django_session" ("session_key" varchar(40) NOT NULL PRIMARY KEY, "session_data" text NOT NULL, "expire_date" datetime NOT NULL)
--
-- Create model CustomUser
--
CREATE TABLE `users_customuser` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `password` varchar(128) NOT NULL, `last_login` datetime(6) NULL, `is_superuser` bool NOT NULL, `username` varchar(150) NOT NULL UNIQUE, `first_name` varchar(150) NOT NULL, `last_name` varchar(150) NOT NULL, `is_staff` bool NOT NULL, `is_active` bool NOT NULL, `date_joined` datetime(6) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `puesto` varchar(50) NULL, `departamento_id` bigint NULL, `region_id` bigint NULL, `status` varchar(20) NOT NULL);
CREATE TABLE `users_customuser_groups` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `customuser_id` bigint NOT NULL, `group_id` integer NOT NULL);
CREATE TABLE `users_customuser_user_permissions` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `customuser_id` bigint NOT NULL, `permission_id` integer NOT NULL);
ALTER TABLE `users_customuser` ADD CONSTRAINT `users_customuser_departamento_id_b907d781_fk_masterdat` FOREIGN KEY (`departamento_id`) REFERENCES `masterdata_departamento` (`id`);
ALTER TABLE `users_customuser` ADD CONSTRAINT `users_customuser_region_id_7fc2f923_fk_masterdata_region_id` FOREIGN KEY (`region_id`) REFERENCES `masterdata_region` (`id`);
ALTER TABLE `users_customuser_groups` ADD CONSTRAINT `users_customuser_groups_customuser_id_group_id_76b619e3_uniq` UNIQUE (`customuser_id`, `group_id`);
ALTER TABLE `users_customuser_groups` ADD CONSTRAINT `users_customuser_gro_customuser_id_958147bf_fk_users_cus` FOREIGN KEY (`customuser_id`) REFERENCES `users_customuser` (`id`);
ALTER TABLE `users_customuser_groups` ADD CONSTRAINT `users_customuser_groups_group_id_01390b14_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);
ALTER TABLE `users_customuser_user_permissions` ADD CONSTRAINT `users_customuser_user_pe_customuser_id_permission_7a7debf6_uniq` UNIQUE (`customuser_id`, `permission_id`);
ALTER TABLE `users_customuser_user_permissions` ADD CONSTRAINT `users_customuser_use_customuser_id_5771478b_fk_users_cus` FOREIGN KEY (`customuser_id`) REFERENCES `users_customuser` (`id`);
ALTER TABLE `users_customuser_user_permissions` ADD CONSTRAINT `users_customuser_use_permission_id_baaa2f74_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);
--
-- Create model Departamento
--
CREATE TABLE `masterdata_departamento` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(100) NOT NULL UNIQUE, `description` longtext NULL);
--
-- Create model Region
--
CREATE TABLE `masterdata_region` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(100) NOT NULL UNIQUE, `description` longtext NULL);
--
-- Create model Finca
--
CREATE TABLE `masterdata_finca` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(100) NOT NULL UNIQUE, `address` varchar(255) NULL, `region_id` bigint NULL);
--
-- Create model Area
--
CREATE TABLE `masterdata_area` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(100) NOT NULL, `description` longtext NULL, `departamento_id` bigint NOT NULL);
--
-- Create model TipoActivo
--
CREATE TABLE `masterdata_tipoactivo` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(100) NOT NULL UNIQUE, `description` longtext NULL, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL);
--
-- Create model Marca
--
CREATE TABLE `masterdata_marca` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(255) NOT NULL UNIQUE, `description` longtext NULL);
--
-- Create model ModeloActivo
--
CREATE TABLE `masterdata_modeloactivo` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `name` varchar(255) NOT NULL UNIQUE, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL, `procesador` varchar(150) NULL, `ram` integer NULL, `almacenamiento` varchar(100) NULL, `tarjeta_grafica` varchar(150) NULL, `wifi` bool NOT NULL, `ethernet` bool NOT NULL, `puertos_ethernet` varchar(50) NULL, `puertos_sfp` varchar(50) NULL, `puerto_consola` bool NOT NULL, `puertos_poe` varchar(50) NULL, `alimentacion` varchar(50) NULL, `administrable` bool NOT NULL, `tamano` varchar(100) NULL, `color` varchar(50) NULL, `conectores` longtext NULL, `cables` longtext NULL, `marca_id` bigint NOT NULL, `tipo_activo_id` bigint NULL);
--
-- Create model AuditLog
--
CREATE TABLE `masterdata_auditlog` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `timestamp` datetime(6) NOT NULL, `activity_type` varchar(20) NOT NULL, `description` longtext NOT NULL, `object_id` integer UNSIGNED NULL CHECK (`object_id` >= 0), `content_type_id` integer NULL, `user_id` bigint NULL, `new_data` json NULL, `old_data` json NULL);
ALTER TABLE `masterdata_finca` ADD CONSTRAINT `masterdata_finca_region_id_690fb480_fk_masterdata_region_id` FOREIGN KEY (`region_id`) REFERENCES `masterdata_region` (`id`);
ALTER TABLE `masterdata_area` ADD CONSTRAINT `masterdata_area_name_departamento_id_a42caf35_uniq` UNIQUE (`name`, `departamento_id`);
ALTER TABLE `masterdata_area` ADD CONSTRAINT `masterdata_area_departamento_id_044735fe_fk_masterdat` FOREIGN KEY (`departamento_id`) REFERENCES `masterdata_departamento` (`id`);
ALTER TABLE `masterdata_modeloactivo` ADD CONSTRAINT `masterdata_modeloactivo_marca_id_b48812bd_fk_masterdata_marca_id` FOREIGN KEY (`marca_id`) REFERENCES `masterdata_marca` (`id`);
ALTER TABLE `masterdata_modeloactivo` ADD CONSTRAINT `masterdata_modeloact_tipo_activo_id_07e52ca8_fk_masterdat` FOREIGN KEY (`tipo_activo_id`) REFERENCES `masterdata_tipoactivo` (`id`);
ALTER TABLE `masterdata_auditlog` ADD CONSTRAINT `masterdata_auditlog_content_type_id_1dde771b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);
ALTER TABLE `masterdata_auditlog` ADD CONSTRAINT `masterdata_auditlog_user_id_e2274d8a_fk_users_customuser_id` FOREIGN KEY (`user_id`) REFERENCES `users_customuser` (`id`);
--
-- Create model Proveedor
--
CREATE TABLE `masterdata_proveedor` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `nombre_empresa` varchar(255) NOT NULL UNIQUE, `nit` varchar(20) NOT NULL UNIQUE, `direccion` longtext NOT NULL, `nombre_contacto` varchar(255) NOT NULL, `telefono_ventas` varchar(20) NULL, `correo_ventas` varchar(254) NULL, `telefono_soporte` varchar(20) NULL, `correo_soporte` varchar(254) NULL, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL);
--
-- Create model Activo
--
CREATE TABLE `masterdata_activo` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `serie` varchar(255) NOT NULL UNIQUE, `hostname` varchar(255) NOT NULL UNIQUE, `fecha_registro` date NOT NULL, `fecha_fin_garantia` date NOT NULL, `solicitante` varchar(255) NOT NULL, `correo_electronico` varchar(254) NOT NULL, `orden_compra` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL, `area_id` bigint NOT NULL, `departamento_id` bigint NOT NULL, `finca_id` bigint NOT NULL, `marca_id` bigint NOT NULL, `modelo_id` bigint NOT NULL, `proveedor_id` bigint NOT NULL, `region_id` bigint NOT NULL, `tipo_activo_id` bigint NOT NULL);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_area_id_aee535f6_fk_masterdata_area_id` FOREIGN KEY (`area_id`) REFERENCES `masterdata_area` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_departamento_id_e3a95d63_fk_masterdat` FOREIGN KEY (`departamento_id`) REFERENCES `masterdata_departamento` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_finca_id_15a6208a_fk_masterdata_finca_id` FOREIGN KEY (`finca_id`) REFERENCES `masterdata_finca` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_marca_id_4b59c128_fk_masterdata_marca_id` FOREIGN KEY (`marca_id`) REFERENCES `masterdata_marca` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_modelo_id_cf8b6a42_fk_masterdat` FOREIGN KEY (`modelo_id`) REFERENCES `masterdata_modeloactivo` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_proveedor_id_022c3d71_fk_masterdat` FOREIGN KEY (`proveedor_id`) REFERENCES `masterdata_proveedor` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_region_id_b43b39fe_fk_masterdata_region_id` FOREIGN KEY (`region_id`) REFERENCES `masterdata_region` (`id`);
ALTER TABLE `masterdata_activo` ADD CONSTRAINT `masterdata_activo_tipo_activo_id_31b56f90_fk_masterdat` FOREIGN KEY (`tipo_activo_id`) REFERENCES `masterdata_tipoactivo` (`id`);
--
-- Delete model Activo
--
DROP TABLE `masterdata_activo` CASCADE;
--
-- Create model Activo
--
CREATE TABLE `assets_activo` (`id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, `serie` varchar(255) NOT NULL UNIQUE, `hostname` varchar(255) NOT NULL UNIQUE, `fecha_registro` date NOT NULL, `fecha_fin_garantia` date NOT NULL, `solicitante` varchar(255) NOT NULL, `correo_electronico` varchar(254) NOT NULL, `orden_compra` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL, `updated_at` datetime(6) NOT NULL, `area_id` bigint NOT NULL, `departamento_id` bigint NOT NULL, `finca_id` bigint NOT NULL, `marca_id` bigint NOT NULL, `modelo_id` bigint NOT NULL, `proveedor_id` bigint NOT NULL, `region_id` bigint NOT NULL, `tipo_activo_id` bigint NOT NULL);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_area_id_43e1facb_fk_masterdata_area_id` FOREIGN KEY (`area_id`) REFERENCES `masterdata_area` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_departamento_id_8a32c62a_fk_masterdat` FOREIGN KEY (`departamento_id`) REFERENCES `masterdata_departamento` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_finca_id_ff3d41c3_fk_masterdata_finca_id` FOREIGN KEY (`finca_id`) REFERENCES `masterdata_finca` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_marca_id_11ec5162_fk_masterdata_marca_id` FOREIGN KEY (`marca_id`) REFERENCES `masterdata_marca` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_modelo_id_2a3780c5_fk_masterdata_modeloactivo_id` FOREIGN KEY (`modelo_id`) REFERENCES `masterdata_modeloactivo` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_proveedor_id_796e8db6_fk_masterdata_proveedor_id` FOREIGN KEY (`proveedor_id`) REFERENCES `masterdata_proveedor` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_region_id_16d00614_fk_masterdata_region_id` FOREIGN KEY (`region_id`) REFERENCES `masterdata_region` (`id`);
ALTER TABLE `assets_activo` ADD CONSTRAINT `assets_activo_tipo_activo_id_40851f1b_fk_masterdat` FOREIGN KEY (`tipo_activo_id`) REFERENCES `masterdata_tipoactivo` (`id`);
--
-- Add field cuenta_contable to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `cuenta_contable` varchar(255) NULL;
--
-- Add field cuotas to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `cuotas` integer NULL;
--
-- Add field tipo_costo to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `tipo_costo` varchar(20) NULL;
--
-- Add field costo to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `costo` numeric(10, 2) NULL;
--
-- Add field moneda to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `moneda` varchar(3) NULL;
--
-- Alter field correo_electronico on activo
--
ALTER TABLE `assets_activo` MODIFY `correo_electronico` varchar(254) NULL;
--
-- Alter field orden_compra on activo
--
ALTER TABLE `assets_activo` MODIFY `orden_compra` varchar(255) NULL;
--
-- Alter field solicitante on activo
--
ALTER TABLE `assets_activo` MODIFY `solicitante` varchar(255) NULL;
--
-- Add field estado to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `estado` varchar(20) DEFAULT 'activo' NOT NULL;
ALTER TABLE `assets_activo` ALTER COLUMN `estado` DROP DEFAULT;
--
-- Add field fecha_baja to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `fecha_baja` datetime(6) NULL;
--
-- Add field motivo_baja to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `motivo_baja` longtext NULL;
--
-- Add field usuario_baja to activo
--
ALTER TABLE `assets_activo` ADD COLUMN `usuario_baja_id` bigint NULL , ADD CONSTRAINT `assets_activo_usuario_baja_id_8c142036_fk_users_customuser_id` FOREIGN KEY (`usuario_baja_id`) REFERENCES `users_customuser`(`id`);
