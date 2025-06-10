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

Upload strings to OneSky:

```
$ stringsgen upload-strings
```

Upload plurals to OneSky:

```
$ stringsgen upload-plurals
```

Download translated strings from OneSky:

```
$ stringsgen download
```

Check not used strings on OneSky:

```
$ stringsgen check
```

Translate strings using AI:

```
$ stringsgen translate
```

Upload AI translated strings to OneSky:

```
$ stringsgen upload-translations
```

# Configuration

You provide your configuration via .stringsgenrc file.

```json
{
    "xlsxUrl": "your_url_for_xlsx_file",
    "glossaryUrl": "your_url_for_glossary_xlsx_file"
    "platform": "ios",
    "outputDir": ".",
    "outputName": "Localizable.strings",
    "webParameterType": "value",
    "baseLanguage": "en",
    "nativeLanguage": "cs",
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
            "oneSkyProjectId": "YOUR_PROJECT_ID",
            "name": "YOUR_SHEET_NAME",
            "valueColumn": "value"
        }
    ],
    "plurals": {
        "oneSkyProjectId": "YOUR_PROJECT_ID",
        "inputFile": "./Localizable.stringsdict"
    }
}
```

You also need to set these environment variables:

```bash
export ONESKY_API_KEY="your_api_key"
export ONESKY_API_SECRET="your_api_secret"
export OPENAI_API_KEY="your_api_key" # Only for AI translation
export DEEPSEEK_API_KEY="your_api_key" # Only for AI translation
export OLLAMA_HOST="http://localhost:11434" # Only for AI translation
```

- **xlsxUrl**
    - URL to XLSX file with strings
- **glossaryUrl**
    - URL to XLSX file with strings glossary from OneSky
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
- **nativeLanguage**
    - used as default language for AI translation
- **languages**
    - supported languages that will be downloaded from OneSky
- **columns**
    - names of columns in each sheet
    - **id**: unique string IDs, will be used for OneSky upload
    - **key**:
        - string keys
        - will be used on platform when downloading or generating strings
        - must be unique, otherwise the strings generator will end with error
    - **isFinal**: TRUE/FALSE, only final strings will be uploaded to OneSky
    - **isHtml**:
        - TRUE/FALSE, if string contains HTML tags
        - the strings generator will handle a string value in special way (Android)
    - **allowDuplicates**: if the column contains **TRUE**, the strings generator will not show warnings for duplicate in values column for given string
    - **aiTranslationDescription**: description of the string for AI translations.
- **sheets**
    - mapping of XLSX sheets to OneSky projects
    - **oneSkyProjectId**: OneSky project ID
    - **name**: sheet name
    - **valueColumn**: column name with strings values
- **plurals**
    - **oneSkyProjectId**: OneSky project ID
    - **inputFile**: source file with plural strings, the file will be uploaded to OneSky

# Spreadsheet requirements

This tool works only with xlsx file format. The easiest way how to create and publish your spreadsheet is using Google Spreadsheet. In `File/Publish to the web...` you choose xlsx file format and put the link in your config file. You can make copy of sample spreadsheet [here](https://docs.google.com/spreadsheets/d/1Jwpwu6p4cFy8rMRmxHO9r5ft8NO86FwFGDMLVneNCTI/edit?ts=5c10d990#gid=0), just use `File/Make a copy...`.

The sample spreadsheet contains prepared autoincrement id generator. If you want to use this id generator, go to `Tools/Script editor`, update script to respect your column and sheet names by changing values of `idsColumnName`, `valuesColumnName` and `sheetNames` variables. Then go to `Current project's triggers` (the clock icon in tool bar) and create a new trigger for event type _On change_ (as function to run select _onChange_).
