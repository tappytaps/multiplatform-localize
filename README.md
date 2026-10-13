# translation-tool

Generates platform specific string resources (iOS, Android and Web) from xlsx files.

# Installation

```
npm i @tappytaps/translation-tool
```

# How to use it?

Go to your project:

```
$ cd path/to/your/project
```

Create and define configuration file:

```
$ touch .stringsgenrc
$ code .stringsgenrc
```

Run strings generator:

```
$ stringsgen generate
```

Upload strings to Weblate:

```
$ stringsgen upload-strings
```

Upload plurals to Weblate:

```
$ stringsgen upload-plurals
```

Download translated strings from Weblate:

```
$ stringsgen download
```

Check not used strings on Weblate:

```
$ stringsgen check
```

## Editing translations

Strings are looked up in the sheets by the platform key from the configuration (`columns.key`, e.g. `key_ios`) or by the string id. The Weblate component is the one mapped to the string's sheet in the configuration, so select the app with `--config`.

Show a string with its translations:

```
$ stringsgen show authentication.accountVerification.message
$ stringsgen show 2392 --lang cs de --json
```

List strings that are not translated yet (they are left out of `stringsgen download`):

```
$ stringsgen missing
$ stringsgen missing --lang cs --sheet "App specific" --json
```

Save a translation:

```
$ stringsgen set authentication.accountVerification.message cs "Zadejte heslo k účtu Bibino <color>%@</color>" --dry-run
$ stringsgen set 2392 cs "Zadejte heslo k účtu Bibino <color>%@</color>"
```

- only translations can be changed, the source language is edited in the sheet and uploaded with `stringsgen upload-strings`
- the string has to be final in the sheet (`isFinal` column), otherwise it is not on Weblate
- the translation must keep the format specifiers (`%@`, `%1$d`, ...) and tags (`<color>`) of the source, `--force` saves it anyway
- the translation is saved as translated, download it to the app with `stringsgen download`

# Configuration

You provide your configuration via .stringsgenrc file.

```json
{
    "xlsxUrl": "YOUR_XLSX_FILE_URL",
    "weblateUrl": "YOUR_WEBLATE_URL",
    "platform": "ios",
    "outputDir": ".",
    "outputName": "Localizable.strings",
    "webParameterType": "value",
    "baseLanguage": "en",
    "languages": ["en", "cs", "it"],
    "columns": {
        "id": "id",
        "key": "key",
        "isFinal": "is_final",
        "isHtml": "is_html",
        "allowDuplicates": "allow_duplicates",
        "description": "description"
    },
    "sheets": [
        {
            "name": "YOUR_SHEET_NAME",
            "valueColumn": "value",
            "weblateProjectSlug": "YOUR_PROJECT_SLUG",
            "weblateComponentSlug": "YOUR_COMPONENT_SLUG"
        }
    ],
    "plurals": {
        "sourceFile": "./Localizable.stringsdict",
        "weblateProjectSlug": "YOUR_PROJECT_SLUG",
        "weblateComponentSlug": "YOUR_COMPONENT_SLUG"
    }
}
```

You also need to set these environment variables:

```bash
export WEBLATE_API_KEY="your_api_key"
```

- **xlsxUrl**
    - URL to XLSX file with strings
- **weblateUrl**
    - URL of your Weblate instance
- **platform**
    - values: ios, android, web
- **outputDir**
    - the destination where strings will be downloaded or generated
- **outputName**
    - the filename of generated or downloaded files
- **webParameterType**
    - only for web
    - values: value, tag
    - default: value
- **baseLanguage**
    - language of source strings in xlsx sheet
- **languages**
    - supported languages that will be downloaded from Weblate
- **columns**
    - names of columns in each sheet
    - **id**: unique string IDs, will be used for Weblate upload
    - **key**:
        - string keys
        - will be used on platform when downloading or generating strings
        - must be unique, otherwise the strings generator will end with error
    - **isFinal**: TRUE/FALSE, only final strings will be uploaded to Weblate
    - **isHtml**:
        - TRUE/FALSE, if string contains HTML tags
        - the strings generator will handle a string value in special way (Android)
    - **allowDuplicates**: if the column contains **TRUE**, the strings generator will not show warnings for duplicate in values column for given string
    - **aiTranslationDescription**: description of the string for AI translations.
- **sheets**
    - mapping of XLSX sheets to Weblate projects
    - **name**: sheet name
    - **valueColumn**: column name with strings values
    - **weblateProjectSlug**: Weblate project slug
    - **weblateComponentSlug**: Weblate component slug
- **plurals**
    - **sourceFile**: source file with plural strings, the file will be uploaded to Weblate
    - **weblateProjectSlug**: Weblate project slug
    - **weblateComponentSlug**: Weblate component slug

# Spreadsheet requirements

This tool works only with xlsx file format. The easiest way how to create and publish your spreadsheet is using Google Spreadsheet. In `File/Publish to the web...` you choose xlsx file format and put the link in your config file. You can make copy of sample spreadsheet [here](https://docs.google.com/spreadsheets/d/1Jwpwu6p4cFy8rMRmxHO9r5ft8NO86FwFGDMLVneNCTI/edit?ts=5c10d990#gid=0), just use `File/Make a copy...`.

The sample spreadsheet contains prepared autoincrement id generator. If you want to use this id generator, go to `Tools/Script editor`, update script to respect your column and sheet names by changing values of `idsColumnName`, `valuesColumnName` and `sheetNames` variables. Then go to `Current project's triggers` (the clock icon in tool bar) and create a new trigger for event type _On change_ (as function to run select _onChange_).
