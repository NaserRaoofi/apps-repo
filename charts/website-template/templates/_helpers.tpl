{{/*
Expand the name of the chart.
*/}}
{{- define "website-template.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "website-template.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "website-template.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "website-template.labels" -}}
helm.sh/chart: {{ include "website-template.chart" . }}
{{ include "website-template.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/website-type: {{ .Values.image.repository }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "website-template.selectorLabels" -}}
app.kubernetes.io/name: {{ include "website-template.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Database host helper
*/}}
{{- define "website-template.databaseHost" -}}
{{- if .Values.database.internal -}}
{{ include "website-template.fullname" . }}-mysql
{{- else -}}
{{ .Values.database.host }}
{{- end -}}
{{- end }}

{{/*
Database name helper
*/}}
{{- define "website-template.databaseName" -}}
{{- if .Values.database.name -}}
{{ .Values.database.name }}
{{- else -}}
{{ .Values.nameOverride | default .Chart.Name | replace "-" "_" }}_db
{{- end -}}
{{- end }}
