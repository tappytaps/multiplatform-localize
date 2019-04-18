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
$ stringsgen
```

# Configuration

You provide your configuration via .stringsgenrc file.

```
{
    "xlsxUrl": "your_url_for_xlsx_file",
    "platform": "ios",
    "idColumnName": "id",
    "keysColumnName": "key_ios",
    "valuesColumnName": "value_en",
    "allowDuplicatesColumnName": "allow_duplicates",
    "descriptionColumnName": "description",
    "isHtmlColumnName": "is_html",
    "sheets": [
        {
            "name": "Sheet1",
            "output": "en.lproj/Sheet1.strings"
        }
    ]
}
```

# Spreadsheet requirements

This tool works only with xlsx file format. The easiest way how to create and publish your spreadsheet is using Google Spreadsheet. In `File/Publish to the web...` you choose xlsx file format and put the link in your config file. You can make copy of sample spreadsheet [here](https://docs.google.com/spreadsheets/d/1Jwpwu6p4cFy8rMRmxHO9r5ft8NO86FwFGDMLVneNCTI/edit?ts=5c10d990#gid=0), just use `File/Make a copy...`.

The sample spreadsheet contains prepared autoincrement id generator. If you want to use this id generator, go to `Tools/Script editor`, update script to respect your column and sheet names by changing values of `idsColumnName`, `valuesColumnName` and `sheetNames` variables. Then go to `Current project's triggers` (the clock icon in tool bar) and create a new trigger for event type _On change_ (as function to run select _onChange_).

## Sheet columns

-   First row of each sheet should define column names.
-   Column names should be same across all sheets.
-   `idColumnName` => Unique string identifier.
-   `keysColumnName` => String key. Must be unique, otherwise the strings generator will end with error.
-   `valuesColumnName` => String value. Don't has to be unique, but the strings generator will warn your if there are any duplicates.
-   `allowDuplicatesColumnName` => If the column contains **TRUE**, the strings generator will not show warnings for duplicate in `valuesColumnName` column for given string.
-   `descriptionColumnName` => Description for string value, if needed.
-   `isHtmlColumnName` => If the column contains **TRUE**, the strings generator will handle a string value in special way (Android).
