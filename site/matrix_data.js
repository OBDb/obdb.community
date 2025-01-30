const matrixData = [
  {
    "make": "Hyundai",
    "model": "IONIQ-5",
    "744_22E001": [
      {
        "id": "IONIQ5_DC_CHRG_STATE",
        "name": "DC charging state",
        "unit": "offon",
        "suggestedMetric": "isCharging",
        "scaling": "raw clamped to [1]",
        "path": "Battery"
      }
    ],
    "744_22E003": [
      {
        "id": "IONIQ5_HVBAT_SOC_VCMS",
        "name": "HV battery charge",
        "unit": "percent",
        "suggestedMetric": "stateOfCharge",
        "scaling": "raw/2 clamped to [100]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_TARGET_VOLT",
        "name": "EVSE target current",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/10 clamped to [6553]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_DC_CHRGNG",
        "name": "DC charging",
        "unit": "offon",
        "suggestedMetric": "",
        "scaling": "raw clamped to [1]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_TARGET_CURR",
        "name": "EVSE target voltage",
        "unit": "amps",
        "suggestedMetric": "",
        "scaling": "raw/10 clamped to [6553]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_CHRG_CNT",
        "name": "Number of DC charges",
        "unit": "scalar",
        "suggestedMetric": "",
        "scaling": "raw clamped to [65535]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_DC_CHRG_TIME",
        "name": "Total DC charging time",
        "unit": "hours",
        "suggestedMetric": "",
        "scaling": "raw clamped to [65535]",
        "path": "Battery"
      }
    ],
    "750_2116": [],
    "750_2130": [],
    "750_221004": [],
    "750_221005": [],
    "750_222021": [],
    "753_221022": [],
    "7A0_22C00B": [
      {
        "id": "IONIQ5_TP_FL",
        "name": "Front left tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontLeftTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "IONIQ5_TP_FR",
        "name": "Front right tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontRightTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "IONIQ5_TP_RL",
        "name": "Rear left tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearLeftTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "IONIQ5_TP_RR",
        "name": "Rear right tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearRightTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      }
    ],
    "7B0_2103": [],
    "7B3_220100": [
      {
        "id": "IONIQ5_VSS",
        "name": "Vehicle speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "speed",
        "scaling": "raw clamped to [255]",
        "path": "Movement"
      }
    ],
    "7C0_2129": [],
    "7C6_22B002": [
      {
        "id": "IONIQ5_ODO_KM",
        "name": "Odometer (Metric)",
        "unit": "kilometers",
        "suggestedMetric": "odometer",
        "scaling": "raw clamped to [4294967295]",
        "path": "Trips"
      },
      {
        "id": "IONIQ5_ODO_MI",
        "name": "Odometer (Imperial)",
        "unit": "miles",
        "suggestedMetric": "odometer",
        "scaling": "raw clamped to [4294967295]",
        "path": "Trips"
      }
    ],
    "7E0_2128": [],
    "7E0_2151": [],
    "7E0_2185": [],
    "7E4_220101": [
      {
        "id": "IONIQ5_HVBAT_SOC",
        "name": "HV battery charge (dash)",
        "unit": "percent",
        "suggestedMetric": "stateOfCharge",
        "scaling": "raw*0.5 clamped to [100]",
        "path": "Battery"
      }
    ],
    "7E4_220102": [
      {
        "id": "IONIQ5_HVBAT_CMU001_VOLT",
        "name": "HV battery module 001 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.001"
      },
      {
        "id": "IONIQ5_HVBAT_CMU002_VOLT",
        "name": "HV battery module 002 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.002"
      },
      {
        "id": "IONIQ5_HVBAT_CMU003_VOLT",
        "name": "HV battery module 003 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.003"
      },
      {
        "id": "IONIQ5_HVBAT_CMU004_VOLT",
        "name": "HV battery module 004 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.004"
      },
      {
        "id": "IONIQ5_HVBAT_CMU005_VOLT",
        "name": "HV battery module 005 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.005"
      },
      {
        "id": "IONIQ5_HVBAT_CMU006_VOLT",
        "name": "HV battery module 006 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.006"
      },
      {
        "id": "IONIQ5_HVBAT_CMU007_VOLT",
        "name": "HV battery module 007 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.007"
      },
      {
        "id": "IONIQ5_HVBAT_CMU008_VOLT",
        "name": "HV battery module 008 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.008"
      },
      {
        "id": "IONIQ5_HVBAT_CMU009_VOLT",
        "name": "HV battery module 009 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.009"
      },
      {
        "id": "IONIQ5_HVBAT_CMU010_VOLT",
        "name": "HV battery module 010 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.010"
      },
      {
        "id": "IONIQ5_HVBAT_CMU011_VOLT",
        "name": "HV battery module 011 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.011"
      },
      {
        "id": "IONIQ5_HVBAT_CMU012_VOLT",
        "name": "HV battery module 012 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.012"
      },
      {
        "id": "IONIQ5_HVBAT_CMU013_VOLT",
        "name": "HV battery module 013 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.013"
      },
      {
        "id": "IONIQ5_HVBAT_CMU014_VOLT",
        "name": "HV battery module 014 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.014"
      },
      {
        "id": "IONIQ5_HVBAT_CMU015_VOLT",
        "name": "HV battery module 015 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.015"
      },
      {
        "id": "IONIQ5_HVBAT_CMU016_VOLT",
        "name": "HV battery module 016 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.016"
      },
      {
        "id": "IONIQ5_HVBAT_CMU017_VOLT",
        "name": "HV battery module 017 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.017"
      },
      {
        "id": "IONIQ5_HVBAT_CMU018_VOLT",
        "name": "HV battery module 018 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.018"
      },
      {
        "id": "IONIQ5_HVBAT_CMU019_VOLT",
        "name": "HV battery module 019 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.019"
      },
      {
        "id": "IONIQ5_HVBAT_CMU020_VOLT",
        "name": "HV battery module 020 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.020"
      },
      {
        "id": "IONIQ5_HVBAT_CMU021_VOLT",
        "name": "HV battery module 021 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.021"
      },
      {
        "id": "IONIQ5_HVBAT_CMU022_VOLT",
        "name": "HV battery module 022 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.022"
      },
      {
        "id": "IONIQ5_HVBAT_CMU023_VOLT",
        "name": "HV battery module 023 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.023"
      },
      {
        "id": "IONIQ5_HVBAT_CMU024_VOLT",
        "name": "HV battery module 024 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.024"
      },
      {
        "id": "IONIQ5_HVBAT_CMU025_VOLT",
        "name": "HV battery module 025 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.025"
      },
      {
        "id": "IONIQ5_HVBAT_CMU026_VOLT",
        "name": "HV battery module 026 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.026"
      },
      {
        "id": "IONIQ5_HVBAT_CMU027_VOLT",
        "name": "HV battery module 027 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.027"
      },
      {
        "id": "IONIQ5_HVBAT_CMU028_VOLT",
        "name": "HV battery module 028 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.028"
      },
      {
        "id": "IONIQ5_HVBAT_CMU029_VOLT",
        "name": "HV battery module 029 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.029"
      },
      {
        "id": "IONIQ5_HVBAT_CMU030_VOLT",
        "name": "HV battery module 030 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.030"
      },
      {
        "id": "IONIQ5_HVBAT_CMU031_VOLT",
        "name": "HV battery module 031 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.031"
      },
      {
        "id": "IONIQ5_HVBAT_CMU032_VOLT",
        "name": "HV battery module 032 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.032"
      }
    ],
    "7E4_220103": [
      {
        "id": "IONIQ5_HVBAT_CMU033_VOLT",
        "name": "HV battery module 033 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.033"
      },
      {
        "id": "IONIQ5_HVBAT_CMU034_VOLT",
        "name": "HV battery module 034 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.034"
      },
      {
        "id": "IONIQ5_HVBAT_CMU035_VOLT",
        "name": "HV battery module 035 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.035"
      },
      {
        "id": "IONIQ5_HVBAT_CMU036_VOLT",
        "name": "HV battery module 036 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.036"
      },
      {
        "id": "IONIQ5_HVBAT_CMU037_VOLT",
        "name": "HV battery module 037 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.037"
      },
      {
        "id": "IONIQ5_HVBAT_CMU038_VOLT",
        "name": "HV battery module 038 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.038"
      },
      {
        "id": "IONIQ5_HVBAT_CMU039_VOLT",
        "name": "HV battery module 039 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.039"
      },
      {
        "id": "IONIQ5_HVBAT_CMU040_VOLT",
        "name": "HV battery module 040 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.040"
      },
      {
        "id": "IONIQ5_HVBAT_CMU041_VOLT",
        "name": "HV battery module 041 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.041"
      },
      {
        "id": "IONIQ5_HVBAT_CMU042_VOLT",
        "name": "HV battery module 042 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.042"
      },
      {
        "id": "IONIQ5_HVBAT_CMU043_VOLT",
        "name": "HV battery module 043 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.043"
      },
      {
        "id": "IONIQ5_HVBAT_CMU044_VOLT",
        "name": "HV battery module 044 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.044"
      },
      {
        "id": "IONIQ5_HVBAT_CMU045_VOLT",
        "name": "HV battery module 045 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.045"
      },
      {
        "id": "IONIQ5_HVBAT_CMU046_VOLT",
        "name": "HV battery module 046 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.046"
      },
      {
        "id": "IONIQ5_HVBAT_CMU047_VOLT",
        "name": "HV battery module 047 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.047"
      },
      {
        "id": "IONIQ5_HVBAT_CMU048_VOLT",
        "name": "HV battery module 048 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.048"
      },
      {
        "id": "IONIQ5_HVBAT_CMU049_VOLT",
        "name": "HV battery module 049 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.049"
      },
      {
        "id": "IONIQ5_HVBAT_CMU050_VOLT",
        "name": "HV battery module 050 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.050"
      },
      {
        "id": "IONIQ5_HVBAT_CMU051_VOLT",
        "name": "HV battery module 051 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.051"
      },
      {
        "id": "IONIQ5_HVBAT_CMU052_VOLT",
        "name": "HV battery module 052 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.052"
      },
      {
        "id": "IONIQ5_HVBAT_CMU053_VOLT",
        "name": "HV battery module 053 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.053"
      },
      {
        "id": "IONIQ5_HVBAT_CMU054_VOLT",
        "name": "HV battery module 054 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.054"
      },
      {
        "id": "IONIQ5_HVBAT_CMU055_VOLT",
        "name": "HV battery module 055 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.055"
      },
      {
        "id": "IONIQ5_HVBAT_CMU056_VOLT",
        "name": "HV battery module 056 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.056"
      },
      {
        "id": "IONIQ5_HVBAT_CMU057_VOLT",
        "name": "HV battery module 057 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.057"
      },
      {
        "id": "IONIQ5_HVBAT_CMU058_VOLT",
        "name": "HV battery module 058 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.058"
      },
      {
        "id": "IONIQ5_HVBAT_CMU059_VOLT",
        "name": "HV battery module 059 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.059"
      },
      {
        "id": "IONIQ5_HVBAT_CMU060_VOLT",
        "name": "HV battery module 060 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.060"
      },
      {
        "id": "IONIQ5_HVBAT_CMU061_VOLT",
        "name": "HV battery module 061 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.061"
      },
      {
        "id": "IONIQ5_HVBAT_CMU062_VOLT",
        "name": "HV battery module 062 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.062"
      },
      {
        "id": "IONIQ5_HVBAT_CMU063_VOLT",
        "name": "HV battery module 063 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.063"
      },
      {
        "id": "IONIQ5_HVBAT_CMU064_VOLT",
        "name": "HV battery module 064 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.064"
      }
    ],
    "7E4_220104": [
      {
        "id": "IONIQ5_HVBAT_CMU065_VOLT",
        "name": "HV battery module 065 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.065"
      },
      {
        "id": "IONIQ5_HVBAT_CMU066_VOLT",
        "name": "HV battery module 066 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.066"
      },
      {
        "id": "IONIQ5_HVBAT_CMU067_VOLT",
        "name": "HV battery module 067 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.067"
      },
      {
        "id": "IONIQ5_HVBAT_CMU068_VOLT",
        "name": "HV battery module 068 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.068"
      },
      {
        "id": "IONIQ5_HVBAT_CMU069_VOLT",
        "name": "HV battery module 069 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.069"
      },
      {
        "id": "IONIQ5_HVBAT_CMU070_VOLT",
        "name": "HV battery module 070 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.070"
      },
      {
        "id": "IONIQ5_HVBAT_CMU071_VOLT",
        "name": "HV battery module 071 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.071"
      },
      {
        "id": "IONIQ5_HVBAT_CMU072_VOLT",
        "name": "HV battery module 072 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.072"
      },
      {
        "id": "IONIQ5_HVBAT_CMU073_VOLT",
        "name": "HV battery module 073 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.073"
      },
      {
        "id": "IONIQ5_HVBAT_CMU074_VOLT",
        "name": "HV battery module 074 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.074"
      },
      {
        "id": "IONIQ5_HVBAT_CMU075_VOLT",
        "name": "HV battery module 075 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.075"
      },
      {
        "id": "IONIQ5_HVBAT_CMU076_VOLT",
        "name": "HV battery module 076 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.076"
      },
      {
        "id": "IONIQ5_HVBAT_CMU077_VOLT",
        "name": "HV battery module 077 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.077"
      },
      {
        "id": "IONIQ5_HVBAT_CMU078_VOLT",
        "name": "HV battery module 078 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.078"
      },
      {
        "id": "IONIQ5_HVBAT_CMU079_VOLT",
        "name": "HV battery module 079 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.079"
      },
      {
        "id": "IONIQ5_HVBAT_CMU080_VOLT",
        "name": "HV battery module 080 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.080"
      },
      {
        "id": "IONIQ5_HVBAT_CMU081_VOLT",
        "name": "HV battery module 081 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.081"
      },
      {
        "id": "IONIQ5_HVBAT_CMU082_VOLT",
        "name": "HV battery module 082 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.082"
      },
      {
        "id": "IONIQ5_HVBAT_CMU083_VOLT",
        "name": "HV battery module 083 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.083"
      },
      {
        "id": "IONIQ5_HVBAT_CMU084_VOLT",
        "name": "HV battery module 084 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.084"
      },
      {
        "id": "IONIQ5_HVBAT_CMU085_VOLT",
        "name": "HV battery module 085 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.085"
      },
      {
        "id": "IONIQ5_HVBAT_CMU086_VOLT",
        "name": "HV battery module 086 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.086"
      },
      {
        "id": "IONIQ5_HVBAT_CMU087_VOLT",
        "name": "HV battery module 087 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.087"
      },
      {
        "id": "IONIQ5_HVBAT_CMU088_VOLT",
        "name": "HV battery module 088 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.088"
      },
      {
        "id": "IONIQ5_HVBAT_CMU089_VOLT",
        "name": "HV battery module 089 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.089"
      },
      {
        "id": "IONIQ5_HVBAT_CMU090_VOLT",
        "name": "HV battery module 090 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.090"
      },
      {
        "id": "IONIQ5_HVBAT_CMU091_VOLT",
        "name": "HV battery module 091 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.091"
      },
      {
        "id": "IONIQ5_HVBAT_CMU092_VOLT",
        "name": "HV battery module 092 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.092"
      },
      {
        "id": "IONIQ5_HVBAT_CMU093_VOLT",
        "name": "HV battery module 093 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.093"
      },
      {
        "id": "IONIQ5_HVBAT_CMU094_VOLT",
        "name": "HV battery module 094 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.094"
      },
      {
        "id": "IONIQ5_HVBAT_CMU095_VOLT",
        "name": "HV battery module 095 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.095"
      },
      {
        "id": "IONIQ5_HVBAT_CMU096_VOLT",
        "name": "HV battery module 096 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.096"
      }
    ],
    "7E4_220105": [
      {
        "id": "IONIQ5_HVBAT_SOH",
        "name": "HV battery state of health",
        "unit": "percent",
        "suggestedMetric": "stateOfHealth",
        "scaling": "raw/10 clamped to [100]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_WH",
        "name": "HV battery remaining energy",
        "unit": "kilowattHours",
        "suggestedMetric": "",
        "scaling": "raw*2 /1000 clamped to [100]",
        "path": "Battery"
      },
      {
        "id": "IONIQ5_HVBAT_SOC_DISP",
        "name": "HV battery charge",
        "unit": "percent",
        "suggestedMetric": "stateOfCharge",
        "scaling": "raw*0.5 clamped to [100]",
        "path": "Battery"
      }
    ],
    "7E4_22010A": [
      {
        "id": "IONIQ5_HVBAT_CMU097_VOLT",
        "name": "HV battery module 097 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.097"
      },
      {
        "id": "IONIQ5_HVBAT_CMU098_VOLT",
        "name": "HV battery module 098 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.098"
      },
      {
        "id": "IONIQ5_HVBAT_CMU099_VOLT",
        "name": "HV battery module 099 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.099"
      },
      {
        "id": "IONIQ5_HVBAT_CMU100_VOLT",
        "name": "HV battery module 100 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.100"
      },
      {
        "id": "IONIQ5_HVBAT_CMU101_VOLT",
        "name": "HV battery module 101 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.101"
      },
      {
        "id": "IONIQ5_HVBAT_CMU102_VOLT",
        "name": "HV battery module 102 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.102"
      },
      {
        "id": "IONIQ5_HVBAT_CMU103_VOLT",
        "name": "HV battery module 103 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.103"
      },
      {
        "id": "IONIQ5_HVBAT_CMU104_VOLT",
        "name": "HV battery module 104 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.104"
      },
      {
        "id": "IONIQ5_HVBAT_CMU105_VOLT",
        "name": "HV battery module 105 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.105"
      },
      {
        "id": "IONIQ5_HVBAT_CMU106_VOLT",
        "name": "HV battery module 106 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.106"
      },
      {
        "id": "IONIQ5_HVBAT_CMU107_VOLT",
        "name": "HV battery module 107 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.107"
      },
      {
        "id": "IONIQ5_HVBAT_CMU108_VOLT",
        "name": "HV battery module 108 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.108"
      },
      {
        "id": "IONIQ5_HVBAT_CMU109_VOLT",
        "name": "HV battery module 109 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.109"
      },
      {
        "id": "IONIQ5_HVBAT_CMU110_VOLT",
        "name": "HV battery module 110 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.110"
      },
      {
        "id": "IONIQ5_HVBAT_CMU111_VOLT",
        "name": "HV battery module 111 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.111"
      },
      {
        "id": "IONIQ5_HVBAT_CMU112_VOLT",
        "name": "HV battery module 112 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.112"
      },
      {
        "id": "IONIQ5_HVBAT_CMU113_VOLT",
        "name": "HV battery module 113 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.113"
      },
      {
        "id": "IONIQ5_HVBAT_CMU114_VOLT",
        "name": "HV battery module 114 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.114"
      },
      {
        "id": "IONIQ5_HVBAT_CMU115_VOLT",
        "name": "HV battery module 115 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.115"
      },
      {
        "id": "IONIQ5_HVBAT_CMU116_VOLT",
        "name": "HV battery module 116 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.116"
      },
      {
        "id": "IONIQ5_HVBAT_CMU117_VOLT",
        "name": "HV battery module 117 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.117"
      },
      {
        "id": "IONIQ5_HVBAT_CMU118_VOLT",
        "name": "HV battery module 118 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.118"
      },
      {
        "id": "IONIQ5_HVBAT_CMU119_VOLT",
        "name": "HV battery module 119 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.119"
      },
      {
        "id": "IONIQ5_HVBAT_CMU120_VOLT",
        "name": "HV battery module 120 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.120"
      },
      {
        "id": "IONIQ5_HVBAT_CMU121_VOLT",
        "name": "HV battery module 121 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.121"
      },
      {
        "id": "IONIQ5_HVBAT_CMU122_VOLT",
        "name": "HV battery module 122 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.122"
      },
      {
        "id": "IONIQ5_HVBAT_CMU123_VOLT",
        "name": "HV battery module 123 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.123"
      },
      {
        "id": "IONIQ5_HVBAT_CMU124_VOLT",
        "name": "HV battery module 124 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.124"
      },
      {
        "id": "IONIQ5_HVBAT_CMU125_VOLT",
        "name": "HV battery module 125 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.125"
      },
      {
        "id": "IONIQ5_HVBAT_CMU126_VOLT",
        "name": "HV battery module 126 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.126"
      },
      {
        "id": "IONIQ5_HVBAT_CMU127_VOLT",
        "name": "HV battery module 127 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.127"
      },
      {
        "id": "IONIQ5_HVBAT_CMU128_VOLT",
        "name": "HV battery module 128 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.128"
      }
    ],
    "7E4_22010B": [
      {
        "id": "IONIQ5_HVBAT_CMU129_VOLT",
        "name": "HV battery module 129 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.129"
      },
      {
        "id": "IONIQ5_HVBAT_CMU130_VOLT",
        "name": "HV battery module 130 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.130"
      },
      {
        "id": "IONIQ5_HVBAT_CMU131_VOLT",
        "name": "HV battery module 131 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.131"
      },
      {
        "id": "IONIQ5_HVBAT_CMU132_VOLT",
        "name": "HV battery module 132 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.132"
      },
      {
        "id": "IONIQ5_HVBAT_CMU133_VOLT",
        "name": "HV battery module 133 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.133"
      },
      {
        "id": "IONIQ5_HVBAT_CMU134_VOLT",
        "name": "HV battery module 134 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.134"
      },
      {
        "id": "IONIQ5_HVBAT_CMU135_VOLT",
        "name": "HV battery module 135 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.135"
      },
      {
        "id": "IONIQ5_HVBAT_CMU136_VOLT",
        "name": "HV battery module 136 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.136"
      },
      {
        "id": "IONIQ5_HVBAT_CMU137_VOLT",
        "name": "HV battery module 137 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.137"
      },
      {
        "id": "IONIQ5_HVBAT_CMU138_VOLT",
        "name": "HV battery module 138 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.138"
      },
      {
        "id": "IONIQ5_HVBAT_CMU139_VOLT",
        "name": "HV battery module 139 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.139"
      },
      {
        "id": "IONIQ5_HVBAT_CMU140_VOLT",
        "name": "HV battery module 140 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.140"
      },
      {
        "id": "IONIQ5_HVBAT_CMU141_VOLT",
        "name": "HV battery module 141 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.141"
      },
      {
        "id": "IONIQ5_HVBAT_CMU142_VOLT",
        "name": "HV battery module 142 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.142"
      },
      {
        "id": "IONIQ5_HVBAT_CMU143_VOLT",
        "name": "HV battery module 143 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.143"
      },
      {
        "id": "IONIQ5_HVBAT_CMU144_VOLT",
        "name": "HV battery module 144 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.144"
      },
      {
        "id": "IONIQ5_HVBAT_CMU145_VOLT",
        "name": "HV battery module 145 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.145"
      },
      {
        "id": "IONIQ5_HVBAT_CMU146_VOLT",
        "name": "HV battery module 146 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.146"
      },
      {
        "id": "IONIQ5_HVBAT_CMU147_VOLT",
        "name": "HV battery module 147 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.147"
      },
      {
        "id": "IONIQ5_HVBAT_CMU148_VOLT",
        "name": "HV battery module 148 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.148"
      },
      {
        "id": "IONIQ5_HVBAT_CMU149_VOLT",
        "name": "HV battery module 149 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.149"
      },
      {
        "id": "IONIQ5_HVBAT_CMU150_VOLT",
        "name": "HV battery module 150 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.150"
      },
      {
        "id": "IONIQ5_HVBAT_CMU151_VOLT",
        "name": "HV battery module 151 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.151"
      },
      {
        "id": "IONIQ5_HVBAT_CMU152_VOLT",
        "name": "HV battery module 152 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.152"
      },
      {
        "id": "IONIQ5_HVBAT_CMU153_VOLT",
        "name": "HV battery module 153 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.153"
      },
      {
        "id": "IONIQ5_HVBAT_CMU154_VOLT",
        "name": "HV battery module 154 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.154"
      },
      {
        "id": "IONIQ5_HVBAT_CMU155_VOLT",
        "name": "HV battery module 155 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.155"
      },
      {
        "id": "IONIQ5_HVBAT_CMU156_VOLT",
        "name": "HV battery module 156 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.156"
      },
      {
        "id": "IONIQ5_HVBAT_CMU157_VOLT",
        "name": "HV battery module 157 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.157"
      },
      {
        "id": "IONIQ5_HVBAT_CMU158_VOLT",
        "name": "HV battery module 158 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.158"
      },
      {
        "id": "IONIQ5_HVBAT_CMU159_VOLT",
        "name": "HV battery module 159 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.159"
      },
      {
        "id": "IONIQ5_HVBAT_CMU160_VOLT",
        "name": "HV battery module 160 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.160"
      }
    ],
    "7E4_22010C": [
      {
        "id": "IONIQ5_HVBAT_CMU161_VOLT",
        "name": "HV battery module 161 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.161"
      },
      {
        "id": "IONIQ5_HVBAT_CMU162_VOLT",
        "name": "HV battery module 162 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.162"
      },
      {
        "id": "IONIQ5_HVBAT_CMU163_VOLT",
        "name": "HV battery module 163 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.163"
      },
      {
        "id": "IONIQ5_HVBAT_CMU164_VOLT",
        "name": "HV battery module 164 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.164"
      },
      {
        "id": "IONIQ5_HVBAT_CMU165_VOLT",
        "name": "HV battery module 165 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.165"
      },
      {
        "id": "IONIQ5_HVBAT_CMU166_VOLT",
        "name": "HV battery module 166 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.166"
      },
      {
        "id": "IONIQ5_HVBAT_CMU167_VOLT",
        "name": "HV battery module 167 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.167"
      },
      {
        "id": "IONIQ5_HVBAT_CMU168_VOLT",
        "name": "HV battery module 168 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.168"
      },
      {
        "id": "IONIQ5_HVBAT_CMU169_VOLT",
        "name": "HV battery module 169 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.169"
      },
      {
        "id": "IONIQ5_HVBAT_CMU170_VOLT",
        "name": "HV battery module 170 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.170"
      },
      {
        "id": "IONIQ5_HVBAT_CMU171_VOLT",
        "name": "HV battery module 171 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.171"
      },
      {
        "id": "IONIQ5_HVBAT_CMU172_VOLT",
        "name": "HV battery module 172 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.172"
      },
      {
        "id": "IONIQ5_HVBAT_CMU173_VOLT",
        "name": "HV battery module 173 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.173"
      },
      {
        "id": "IONIQ5_HVBAT_CMU174_VOLT",
        "name": "HV battery module 174 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.174"
      },
      {
        "id": "IONIQ5_HVBAT_CMU175_VOLT",
        "name": "HV battery module 175 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.175"
      },
      {
        "id": "IONIQ5_HVBAT_CMU176_VOLT",
        "name": "HV battery module 176 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.176"
      },
      {
        "id": "IONIQ5_HVBAT_CMU177_VOLT",
        "name": "HV battery module 177 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.177"
      },
      {
        "id": "IONIQ5_HVBAT_CMU178_VOLT",
        "name": "HV battery module 178 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.178"
      },
      {
        "id": "IONIQ5_HVBAT_CMU179_VOLT",
        "name": "HV battery module 179 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.179"
      },
      {
        "id": "IONIQ5_HVBAT_CMU180_VOLT",
        "name": "HV battery module 180 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.180"
      },
      {
        "id": "IONIQ5_HVBAT_CMU181_VOLT",
        "name": "HV battery module 181 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.181"
      },
      {
        "id": "IONIQ5_HVBAT_CMU182_VOLT",
        "name": "HV battery module 182 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.182"
      },
      {
        "id": "IONIQ5_HVBAT_CMU183_VOLT",
        "name": "HV battery module 183 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.183"
      },
      {
        "id": "IONIQ5_HVBAT_CMU184_VOLT",
        "name": "HV battery module 184 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.184"
      },
      {
        "id": "IONIQ5_HVBAT_CMU185_VOLT",
        "name": "HV battery module 185 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.185"
      },
      {
        "id": "IONIQ5_HVBAT_CMU186_VOLT",
        "name": "HV battery module 186 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.186"
      },
      {
        "id": "IONIQ5_HVBAT_CMU187_VOLT",
        "name": "HV battery module 187 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.187"
      },
      {
        "id": "IONIQ5_HVBAT_CMU188_VOLT",
        "name": "HV battery module 188 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.188"
      },
      {
        "id": "IONIQ5_HVBAT_CMU189_VOLT",
        "name": "HV battery module 189 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.189"
      },
      {
        "id": "IONIQ5_HVBAT_CMU190_VOLT",
        "name": "HV battery module 190 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.190"
      },
      {
        "id": "IONIQ5_HVBAT_CMU191_VOLT",
        "name": "HV battery module 191 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.191"
      },
      {
        "id": "IONIQ5_HVBAT_CMU192_VOLT",
        "name": "HV battery module 192 voltage",
        "unit": "volts",
        "suggestedMetric": "",
        "scaling": "raw/50 clamped to [5.1]",
        "path": "Battery.Modules.192"
      }
    ]
  },
  {
    "make": "Subaru",
    "model": "WRX",
    "744_22E001": [],
    "744_22E003": [],
    "750_2116": [],
    "750_2130": [],
    "750_221004": [],
    "750_221005": [],
    "750_222021": [],
    "753_221022": [
      {
        "id": "WRX_TP_RL",
        "name": "Rear left tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearLeftTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "WRX_TP_RR",
        "name": "Rear right tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearRightTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "WRX_TP_FR",
        "name": "Front right tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontRightTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      },
      {
        "id": "WRX_TP_FL",
        "name": "Front left tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontLeftTirePressure",
        "scaling": "raw/5 clamped to [51]",
        "path": "Tires"
      }
    ],
    "7A0_22C00B": [],
    "7B0_2103": [],
    "7B3_220100": [],
    "7C0_2129": [],
    "7C6_22B002": [],
    "7E0_2128": [],
    "7E0_2151": [],
    "7E0_2185": [],
    "7E4_220101": [],
    "7E4_220102": [],
    "7E4_220103": [],
    "7E4_220104": [],
    "7E4_220105": [],
    "7E4_22010A": [],
    "7E4_22010B": [],
    "7E4_22010C": []
  },
  {
    "make": "Toyota",
    "model": "Camry",
    "744_22E001": [],
    "744_22E003": [],
    "750_2116": [
      {
        "id": "CAMRY_TT_FL",
        "name": "Front left tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-40, 215]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TT_FR",
        "name": "Front right tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-40, 215]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TT_RL",
        "name": "Rear left tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-40, 215]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TT_RR",
        "name": "Rear right tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-40, 215]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TT_SPARE",
        "name": "Spare tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-40, 215]",
        "path": "Tires"
      }
    ],
    "750_2130": [
      {
        "id": "CAMRY_TP_FL",
        "name": "Front left tire pressure",
        "unit": "bars",
        "suggestedMetric": "frontLeftTirePressure",
        "scaling": "raw/58 +-0.5 clamped to [4]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TP_FR",
        "name": "Front right tire pressure",
        "unit": "bars",
        "suggestedMetric": "frontRightTirePressure",
        "scaling": "raw/58 +-0.5 clamped to [4]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TP_RL",
        "name": "Rear left tire pressure",
        "unit": "bars",
        "suggestedMetric": "rearLeftTirePressure",
        "scaling": "raw/58 +-0.5 clamped to [4]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TP_RR",
        "name": "Rear right tire pressure",
        "unit": "bars",
        "suggestedMetric": "rearRightTirePressure",
        "scaling": "raw/58 +-0.5 clamped to [4]",
        "path": "Tires"
      },
      {
        "id": "CAMRY_TP_SPARE",
        "name": "Spare tire pressure",
        "unit": "bars",
        "suggestedMetric": "",
        "scaling": "raw/58 +-0.5 clamped to [4]",
        "path": "Tires"
      }
    ],
    "750_221004": [],
    "750_221005": [],
    "750_222021": [],
    "753_221022": [],
    "7A0_22C00B": [],
    "7B0_2103": [
      {
        "id": "CAMRY_TIRE_FR_SPD",
        "name": "Front right wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "CAMRY_TIRE_FL_SPD",
        "name": "Front left wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "CAMRY_TIRE_RR_SPD",
        "name": "Rear right wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "CAMRY_TIRE_RL_SPD",
        "name": "Rear left wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      }
    ],
    "7B3_220100": [],
    "7C0_2129": [],
    "7C6_22B002": [],
    "7E0_2128": [],
    "7E0_2151": [],
    "7E0_2185": [],
    "7E4_220101": [],
    "7E4_220102": [],
    "7E4_220103": [],
    "7E4_220104": [],
    "7E4_220105": [],
    "7E4_22010A": [],
    "7E4_22010B": [],
    "7E4_22010C": []
  },
  {
    "make": "Toyota",
    "model": "Corolla-Hybrid",
    "744_22E001": [],
    "744_22E003": [],
    "750_2116": [],
    "750_2130": [],
    "750_221004": [
      {
        "id": "COROLLAHYBRID_TT_1",
        "name": "Rear right tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-30, 100]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TT_2",
        "name": "Rear left tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-30, 100]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TT_3",
        "name": "Front right tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-30, 100]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TT_4",
        "name": "Front left tire temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw+-40 clamped to [-30, 100]",
        "path": "Tires"
      }
    ],
    "750_221005": [
      {
        "id": "COROLLAHYBRID_TP_1",
        "name": "Rear right tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearRightTirePressure",
        "scaling": "raw/4.125 +-5.6969697 clamped to [56.8]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TP_2",
        "name": "Rear left tire pressure",
        "unit": "psi",
        "suggestedMetric": "rearLeftTirePressure",
        "scaling": "raw/4.125 +-5.6969697 clamped to [56.8]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TP_3",
        "name": "Front right tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontRightTirePressure",
        "scaling": "raw/4.125 +-5.6969697 clamped to [56.8]",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TP_4",
        "name": "Front left tire pressure",
        "unit": "psi",
        "suggestedMetric": "frontLeftTirePressure",
        "scaling": "raw/4.125 +-5.6969697 clamped to [56.8]",
        "path": "Tires"
      }
    ],
    "750_222021": [
      {
        "id": "COROLLAHYBRID_TID_1",
        "name": "Tire 1 position",
        "unit": "",
        "suggestedMetric": "",
        "scaling": "Mapped values: {'1': {'description': 'Front left', 'value': 'FL'}, '2': {'description': 'Front right', 'value': 'FR'}, '3': {'description': 'Rear left', 'value': 'RL'}, '4': {'description': 'Rear right', 'value': 'RR'}}",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TID_2",
        "name": "Tire 2 position",
        "unit": "",
        "suggestedMetric": "",
        "scaling": "Mapped values: {'1': {'description': 'Front left', 'value': 'FL'}, '2': {'description': 'Front right', 'value': 'FR'}, '3': {'description': 'Rear left', 'value': 'RL'}, '4': {'description': 'Rear right', 'value': 'RR'}}",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TID_3",
        "name": "Tire 3 position",
        "unit": "",
        "suggestedMetric": "",
        "scaling": "Mapped values: {'1': {'description': 'Front left', 'value': 'FL'}, '2': {'description': 'Front right', 'value': 'FR'}, '3': {'description': 'Rear left', 'value': 'RL'}, '4': {'description': 'Rear right', 'value': 'RR'}}",
        "path": "Tires"
      },
      {
        "id": "COROLLAHYBRID_TID_4",
        "name": "Tire 4 position",
        "unit": "",
        "suggestedMetric": "",
        "scaling": "Mapped values: {'1': {'description': 'Front left', 'value': 'FL'}, '2': {'description': 'Front right', 'value': 'FR'}, '3': {'description': 'Rear left', 'value': 'RL'}, '4': {'description': 'Rear right', 'value': 'RR'}}",
        "path": "Tires"
      }
    ],
    "753_221022": [],
    "7A0_22C00B": [],
    "7B0_2103": [],
    "7B3_220100": [],
    "7C0_2129": [],
    "7C6_22B002": [],
    "7E0_2128": [],
    "7E0_2151": [],
    "7E0_2185": [],
    "7E4_220101": [],
    "7E4_220102": [],
    "7E4_220103": [],
    "7E4_220104": [],
    "7E4_220105": [],
    "7E4_22010A": [],
    "7E4_22010B": [],
    "7E4_22010C": []
  },
  {
    "make": "Toyota",
    "model": "RAV4",
    "744_22E001": [],
    "744_22E003": [],
    "750_2116": [],
    "750_2130": [],
    "750_221004": [],
    "750_221005": [],
    "750_222021": [],
    "753_221022": [],
    "7A0_22C00B": [],
    "7B0_2103": [
      {
        "id": "RAV4_TIRE_FR_SPD",
        "name": "Front right wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "RAV4_TIRE_FL_SPD",
        "name": "Front left wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "RAV4_TIRE_RR_SPD",
        "name": "Rear right wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      },
      {
        "id": "RAV4_TIRE_RL_SPD",
        "name": "Rear left wheel speed",
        "unit": "kilometersPerHour",
        "suggestedMetric": "",
        "scaling": "raw*256 /200 clamped to [326.4]",
        "path": "Movement"
      }
    ],
    "7B3_220100": [],
    "7C0_2129": [
      {
        "id": "RAV4_FLI_VOL",
        "name": "Fuel level (volume)",
        "unit": "liters",
        "suggestedMetric": "",
        "scaling": "raw/2 clamped to [127.5]",
        "path": "Fuel"
      }
    ],
    "7C6_22B002": [],
    "7E0_2128": [
      {
        "id": "RAV4_ODO",
        "name": "Odometer",
        "unit": "kilometers",
        "suggestedMetric": "odometer",
        "scaling": "raw clamped to [4294967295]",
        "path": "Trips"
      }
    ],
    "7E0_2151": [
      {
        "id": "RAV4_PREV_TRIP_DST",
        "name": "Previous trip distance",
        "unit": "kilometers",
        "suggestedMetric": "",
        "scaling": "raw/100 clamped to [655.35]",
        "path": "Trips"
      },
      {
        "id": "RAV4_VVTOT",
        "name": "Variable valve timing oil temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw clamped to [-40, 215]",
        "path": "Engine"
      },
      {
        "id": "RAV4_EOT",
        "name": "Engine oil temperature",
        "unit": "celsius",
        "suggestedMetric": "",
        "scaling": "raw clamped to [-40, 215]",
        "path": "Engine"
      }
    ],
    "7E0_2185": [
      {
        "id": "RAV4_GEAR",
        "name": "Gear",
        "unit": "",
        "suggestedMetric": "",
        "scaling": "Mapped values: {'1': {'description': 'Park', 'value': 'PARK'}}",
        "path": "Engine"
      }
    ],
    "7E4_220101": [],
    "7E4_220102": [],
    "7E4_220103": [],
    "7E4_220104": [],
    "7E4_220105": [],
    "7E4_22010A": [],
    "7E4_22010B": [],
    "7E4_22010C": []
  }
];
const ecuPidCombos = [
  [
    "744",
    "22E001"
  ],
  [
    "744",
    "22E003"
  ],
  [
    "750",
    "2116"
  ],
  [
    "750",
    "2130"
  ],
  [
    "750",
    "221004"
  ],
  [
    "750",
    "221005"
  ],
  [
    "750",
    "222021"
  ],
  [
    "753",
    "221022"
  ],
  [
    "7A0",
    "22C00B"
  ],
  [
    "7B0",
    "2103"
  ],
  [
    "7B3",
    "220100"
  ],
  [
    "7C0",
    "2129"
  ],
  [
    "7C6",
    "22B002"
  ],
  [
    "7E0",
    "2128"
  ],
  [
    "7E0",
    "2151"
  ],
  [
    "7E0",
    "2185"
  ],
  [
    "7E4",
    "220101"
  ],
  [
    "7E4",
    "220102"
  ],
  [
    "7E4",
    "220103"
  ],
  [
    "7E4",
    "220104"
  ],
  [
    "7E4",
    "220105"
  ],
  [
    "7E4",
    "22010A"
  ],
  [
    "7E4",
    "22010B"
  ],
  [
    "7E4",
    "22010C"
  ]
];