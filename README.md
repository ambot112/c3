# Drupal Installation using DDEV

This guide explains how to install a Drupal project using **DDEV**,
**Composer**, and **Drush** with existing configuration.

------------------------------------------------------------------------

## 📋 Prerequisites

Make sure the following tools are installed on your machine:

-   DDEV
-   Docker
-   Composer
-   Node.js & NPM
-   Git (optional but recommended)

------------------------------------------------------------------------

## 🚀 Installation Steps

### 1. Start DDEV Environment

Run the following command inside the project root directory:

    ddev start

This will: - Initialize containers - Setup web and database services -
Prepare your local development environment

------------------------------------------------------------------------

### 2. Install Project Dependencies

Install Drupal and required packages using Composer:

    ddev composer install

This command will: - Download all dependencies from `composer.json` -
Setup Drupal core and contributed modules

------------------------------------------------------------------------

### 3. Install Drupal using Existing Configuration

Run the Drupal site installation using Drush:

    ddev drush si minimal --existing-config -y

This will: - Install Drupal using the **minimal** profile - Import
configuration from the `config/sync` directory - Setup database tables -
Apply site configuration

------------------------------------------------------------------------

## 🎨 Theme Build Instructions

To install and build the custom theme, run the following steps:

### 1. Navigate to Theme Directory

    cd web/themes/custom/cerian

### 2. Install Theme Dependencies

    npm install

### 3. Build Theme Assets

    npm run build

### 4. Clear Drupal Cache

    ddev drush cr

------------------------------------------------------------------------

## 🧩 Custom Module: senior_portal

The `senior_portal` module provides custom functionality for the
project.

### Features

-   Adds a **UMass Cost Calculator** displayed as a **block plugin**
-   Uses **custom services, routes, and controllers** to connect with
    external APIs
-   Implements **ReactJS** for frontend functionality
-   Uses Drupal hooks:
    -   `hook_presave()`
    -   `hook_form_alter()`
-   Hooks are used to alter the **body field value** before content is
    saved or displayed

------------------------------------------------------------------------

### ⚛️ React Build Instructions for senior_portal

Run the following steps to build React assets:

#### 1. Navigate to JS Directory

    cd web/modules/custom/senior_portal/js

#### 2. Install Dependencies

    npm install

#### 3. Build React Assets

    npm run build

------------------------------------------------------------------------

### 🧹 Clear Drupal Cache After Build

    ddev drush cr

------------------------------------------------------------------------

## 🌐 Access Your Site

After installation, open your Drupal site using:

    ddev launch

------------------------------------------------------------------------

## 🔐 Admin Access

If admin credentials are included in the configuration, use them to log
in.\
Otherwise, you can generate a login link:

    ddev drush uli

------------------------------------------------------------------------

## 🧹 Useful DDEV Commands

  Command               Description
  --------------------- ----------------------
  `ddev start`          Start containers
  `ddev stop`           Stop containers
  `ddev restart`        Restart environment
  `ddev drush status`   Check Drupal status
  `ddev ssh`            Access web container

------------------------------------------------------------------------

## ✅ Notes

-   Ensure configuration exists in `config/sync` before running site
    install.
-   Database credentials are automatically handled by DDEV.
