/**
 * ==============================================================================
 * MODEL: SURAT MODEL (js/models/SuratModel.js)
 * ==============================================================================
 */
class SuratModel {
  static async submit(payload) {
    return await ApiModel.call('submitSurat', payload);
  }

  static async track(query) {
    return await ApiModel.call('getSuratList', { query: query, nik: query, id_pengajuan: query });
  }

  static async fetchAllAdmin() {
    return await ApiModel.call('getSuratList');
  }

  static async updateStatusAdmin(id, status, catatan) {
    return await ApiModel.call('updateSuratStatus', { id_pengajuan: id, status: status, catatan_admin: catatan });
  }
}

/**
 * ==============================================================================
 * MODEL: LAPOR MODEL (js/models/LaporModel.js)
 * ==============================================================================
 */
class LaporModel {
  static async submit(payload) {
    return await ApiModel.call('submitLaporan', payload);
  }

  static async fetchPublic() {
    return await ApiModel.call('getLaporanList');
  }

  static async updateStatusAdmin(id, status) {
    return await ApiModel.call('updateLaporanStatus', { id_laporan: id, status: status });
  }
}

/**
 * ==============================================================================
 * MODEL: AGENDA MODEL (js/models/AgendaModel.js)
 * ==============================================================================
 */
class AgendaModel {
  static async fetchAll() {
    return await ApiModel.call('getAgendaList');
  }

  static async add(payload) {
    return await ApiModel.call('addAgenda', payload);
  }

  static async delete(id) {
    return await ApiModel.call('deleteAgenda', { id_agenda: id });
  }
}

/**
 * ==============================================================================
 * MODEL: RT MODEL (js/models/RTModel.js)
 * ==============================================================================
 */
class RTModel {
  static async fetchAll() {
    return await ApiModel.call('getDirektoriRT');
  }
}

/**
 * ==============================================================================
 * MODEL: KAS MODEL (js/models/KasModel.js)
 * ==============================================================================
 */
class KasModel {
  static async fetch() {
    return await ApiModel.call('getKasRW');
  }

  static async update(payload) {
    return await ApiModel.call('updateKasRW', payload);
  }
}
